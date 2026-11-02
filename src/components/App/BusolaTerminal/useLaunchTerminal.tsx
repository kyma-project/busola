import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import {
  generateTerminalPodName,
  provisionPod,
} from 'components/App/BusolaTerminal/provisionPod';
import { FetchFn, useFetch } from 'shared/hooks/BackendAPI/useFetch';
import {
  ConnectionType,
  terminalSessionAtom,
  TerminalSessionState,
} from 'state/terminalSessionAtom';
import { authDataAtom } from 'state/authDataAtom';
import { clusterAtom } from 'state/clusterAtom';
import { ssoDataAtom } from 'state/ssoDataAtom';
import { SetStateAction } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useFeature } from 'hooks/useFeature';
import {
  configFeaturesNames,
  TerminalFeature as TerminalFeatureConfig,
} from 'state/types';
import { showTerminalAtom } from 'state/showTerminalAtom';

const DEFAULT_IMAGE =
  'europe-docker.pkg.dev/kyma-project/prod/busola-dev-toolbox:latest';

export const TERMINAL_NAMESPACE_NAME = 'busola-terminal';
export const TERMINAL_CONTAINER_NAME = 'dev-toolbox';
export const TERMINAL_COMMAND = 'bash';

export function useLaunchTerminal() {
  const { config } = useFeature<TerminalFeatureConfig>(
    configFeaturesNames.TERMINAL,
  );
  const setShowTerminal = useSetAtom(showTerminalAtom);
  const authData = useAtomValue(authDataAtom);
  const cluster = useAtomValue(clusterAtom);
  const ssoData = useAtomValue(ssoDataAtom);
  const fetchFn = useFetch();
  const setSession = useSetAtom(terminalSessionAtom);

  return () => {
    (async () => {
      const clusterServer =
        cluster?.currentContext?.cluster?.cluster?.server ?? '';

      const image: string = config?.image ?? DEFAULT_IMAGE;

      const abortController = new AbortController();
      const authHeaders = new Headers(
        createHeaders(authData, cluster, ssoData),
      );
      const credential =
        authHeaders.get('X-K8s-Authorization')?.replace('Bearer ', '') ??
        authHeaders.get('X-Client-Certificate-Data') ??
        '';
      const podName = await generateTerminalPodName(clusterServer, credential);
      // Launch provision in background, open terminal view immediately.
      createBusolaTerminalPod(
        fetchFn,
        setSessionInfo,
        image,
        podName,
        TERMINAL_NAMESPACE_NAME,
        TERMINAL_CONTAINER_NAME,
        abortController,
      );
      setShowTerminal((prev) => ({ ...prev, isOpen: !prev.isOpen }));
    })().catch((e) => {
      console.error('Failed to launch terminal', e);
      setSessionInfo((prev) => ({
        ...prev,
        status: 'idle',
        errorMessage: String(e),
      }));
    });
  };
}

async function createBusolaTerminalPod(
  fetchFn: FetchFn,
  setSession: (update: SetStateAction<TerminalSessionState>) => void,
  image: string,
  podName: string,
  namespace: string,
  containerName: string,
  abortController: AbortController,
): Promise<void> {
  setSession((prev) => ({
    ...prev,
    abortController,
    status: 'provisioning',
    deprovisionPod: deprovisionPod(fetchFn, namespace, podName, setSession),
  }));
  try {
    await provisionPod({
      fetchFn,
      podName,
      image,
      namespace,
      containerName,
      abortController,
    });
  } catch (e) {
    abortController.abort(e);
    throw e;
  }

  setSession({
    connectionType: ConnectionType.Attach,
    podName: podName,
    container: TERMINAL_CONTAINER_NAME,
    namespace,
    command: TERMINAL_COMMAND,
    status: 'provisioned',
    errorMessage: null,
    abortController,
    deprovisionPod: deprovisionPod(fetchFn, namespace, podName, setSession),
  });
}

function deprovisionPod(
  fetchFn: FetchFn,
  namespace: string,
  podName: string,
  setSession: (update: SetStateAction<TerminalSessionState>) => void,
) {
  return async () => {
    setSession((prev) => ({ ...prev, status: 'idle' }));
    try {
      await fetchFn({
        relativeUrl: `/api/v1/namespaces/${namespace}/pods/${podName}`,
        init: { method: 'DELETE' },
      });
    } catch (e) {
      console.warn(`Failed to deprovision terminal pod ${podName}`, e);
    }
  };
}
