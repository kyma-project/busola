import { useTranslation } from 'react-i18next';
import { SetStateAction, useAtomValue, useSetAtom } from 'jotai';
import { useLocation } from 'react-router';
import { useFeature } from 'hooks/useFeature';
import { showTerminalAtom } from 'state/showTerminalAtom';
import {
  configFeaturesNames,
  TerminalFeature as TerminalFeatureConfig,
} from 'state/types';
import { ShellBarAction } from './ShellBarAction';
import {
  ConnectionType,
  terminalSessionAtom,
  TerminalSessionState,
} from 'state/terminalSessionAtom';
import {
  generateTerminalPodName,
  provisionPod,
} from 'components/App/BusolaTerminal/provisionPod';
import { clusterAtom } from 'state/clusterAtom';
import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import { authDataAtom } from 'state/authDataAtom';
import { ssoDataAtom } from 'state/ssoDataAtom';
import { FetchFn, useFetch } from 'shared/hooks/BackendAPI/useFetch';
import { RefObject, useRef } from 'react';

const DEFAULT_IMAGE =
  'europe-docker.pkg.dev/kyma-project/prod/busola-dev-toolbox:latest';

export const TERMINAL_NAMESPACE_NAME = 'busola-terminal';
export const TERMINAL_CONTAINER_NAME = 'dev-toolbox';
export const TERMINAL_COMMAND = 'bash';

export function TerminalFeature() {
  const { t } = useTranslation();
  const fetchFn = useFetch();
  const setShowTerminal = useSetAtom(showTerminalAtom);
  const { isEnabled: isTerminalEnabled } = useFeature(
    configFeaturesNames.TERMINAL,
  );
  const setSession = useSetAtom(terminalSessionAtom);
  const { config } = useFeature<TerminalFeatureConfig>(
    configFeaturesNames.TERMINAL,
  );
  const image: string = config?.image ?? DEFAULT_IMAGE;
  const location = useLocation();
  const isOnClustersPage = location.pathname === '/clusters';
  const authData = useAtomValue(authDataAtom);
  const cluster = useAtomValue(clusterAtom);
  const ssoData = useAtomValue(ssoDataAtom);
  const clusterServer = cluster?.currentContext?.cluster?.cluster?.server ?? '';
  const abortControllerRef = useRef<AbortController>(new AbortController());

  if (!isTerminalEnabled || isOnClustersPage || !authData) return null;

  const headers = createHeaders(authData, cluster, ssoData);
  const authHeaders = new Headers(headers);
  const credential =
    authHeaders.get('X-K8s-Authorization')?.replace('Bearer ', '') ??
    authHeaders.get('X-Client-Certificate-Data') ??
    '';

  return (
    <ShellBarAction
      icon="command-line-interfaces"
      text={t('terminal.name')}
      title={t('terminal.name')}
      onClick={async () => {
        abortControllerRef.current = new AbortController();
        const podName = await generateTerminalPodName(
          clusterServer,
          credential,
        );
        await createBusolaTerminalPod(
          fetchFn,
          setSession,
          image,
          podName,
          TERMINAL_NAMESPACE_NAME,
          abortControllerRef,
        );
        setShowTerminal((prev) => ({ ...prev, isOpen: !prev.isOpen }));
      }}
    />
  );
}

async function createBusolaTerminalPod(
  fetchFn: FetchFn,
  setSession: (update: SetStateAction<TerminalSessionState>) => void,
  image: string,
  podName: string,
  namespace: string,
  abortControllerRef: RefObject<AbortController>,
): Promise<void> {
  try {
    await provisionPod({
      fetchFn,
      podName,
      image,
      namespace,
      abortController: abortControllerRef.current,
    });
  } catch (e) {
    // TODO: Handler reconnections
    abortControllerRef.current.abort(e);
    throw e;
  }

  setSession({
    connectionType: ConnectionType.Attach,
    podName: podName,
    container: TERMINAL_CONTAINER_NAME,
    namespace: TERMINAL_NAMESPACE_NAME,
    command: TERMINAL_COMMAND,
    status: 'provisioning',
    errorMessage: null,
    abortController: abortControllerRef.current,
    deprovisionPod: deprovisionPod(fetchFn, TERMINAL_NAMESPACE_NAME, podName),
  });
}

function deprovisionPod(fetchFn: FetchFn, namespace: string, podName: string) {
  return async () => {
    try {
      await fetchFn({
        relativeUrl: `/api/v1/namespaces/${namespace}/pods/${podName}`,
        init: { method: 'DELETE' },
      });
    } catch {
      // best-effort
    }
  };
}
