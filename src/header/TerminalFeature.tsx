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

const DEFAULT_IMAGE =
  'europe-docker.pkg.dev/kyma-project/prod/busola-dev-toolbox:latest';

export const TERMINAL_NAMESPACE_NAME = 'busola-terminal';
export const TERMINAL_CONTAINER_NAME = 'dev-toolbox';
export const TERMINAL_COMMAND = 'bash';

export function TerminalFeature() {
  const { t } = useTranslation();
  const fetchFn = useFetch();
  const setShowTerminal = useSetAtom(showTerminalAtom);
  const { isEnabled: isTerminalEnabled, config } =
    useFeature<TerminalFeatureConfig>(configFeaturesNames.TERMINAL);
  const setSession = useSetAtom(terminalSessionAtom);
  const image: string = config?.image ?? DEFAULT_IMAGE;
  const location = useLocation();
  const isOnClustersPage = location.pathname === '/clusters';
  const authData = useAtomValue(authDataAtom);
  const cluster = useAtomValue(clusterAtom);
  const ssoData = useAtomValue(ssoDataAtom);
  const clusterServer = cluster?.currentContext?.cluster?.cluster?.server ?? '';

  if (!isTerminalEnabled || isOnClustersPage || !authData) return null;

  return (
    <ShellBarAction
      icon="command-line-interfaces"
      text={t('terminal.name')}
      title={t('terminal.name')}
      onClick={async () => {
        const abortController = new AbortController();
        const authHeaders = new Headers(
          createHeaders(authData, cluster, ssoData),
        );
        const credential =
          authHeaders.get('X-K8s-Authorization')?.replace('Bearer ', '') ??
          authHeaders.get('X-Client-Certificate-Data') ??
          '';
        const podName = await generateTerminalPodName(
          clusterServer,
          credential,
        );
        createBusolaTerminalPod(
          fetchFn,
          setSession,
          image,
          podName,
          TERMINAL_NAMESPACE_NAME,
          TERMINAL_CONTAINER_NAME,
          abortController,
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
  containerName: string,
  abortController: AbortController,
): Promise<void> {
  setSession((prev) => ({ ...prev, status: 'provisioning' }));
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
    setSession((prev) => ({ ...prev, status: 'error' }));
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
