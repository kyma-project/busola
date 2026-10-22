import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useLocation } from 'react-router';
import { useFeature } from 'hooks/useFeature';
import { showTerminalAtom } from 'state/showTerminalAtom';
import {
  configFeaturesNames,
  TerminalFeature as TerminalFeatureConfig,
} from 'state/types';
import { ShellBarAction } from './ShellBarAction';
import { createBusolaTerminalPod } from 'components/App/BusolaTerminal/useProvisionPod';
import { terminalSessionAtom } from 'state/terminalSessionAtom';
import { generateTerminalPodName } from 'components/App/BusolaTerminal/provisionPod';
import { clusterAtom } from 'state/clusterAtom';
import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import { authDataAtom } from 'state/authDataAtom';
import { ssoDataAtom } from 'state/ssoDataAtom';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';

const DEFAULT_IMAGE =
  'europe-docker.pkg.dev/kyma-project/prod/busola-dev-toolbox:latest';

export function TerminalFeature() {
  const { t } = useTranslation();
  const fetchFn = useFetch();
  const setShowTerminal = useSetAtom(showTerminalAtom);
  const { isEnabled: isTerminalEnabled } = useFeature(
    configFeaturesNames.TERMINAL,
  );
  const [sessionInfo, setSession] = useAtom(terminalSessionAtom);
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

  const headers = createHeaders(authData, cluster, ssoData);
  const authHeaders = new Headers(headers);
  const credential =
    authHeaders.get('X-K8s-Authorization')?.replace('Bearer ', '') ??
    authHeaders.get('X-Client-Certificate-Data') ??
    '';

  if (!isTerminalEnabled || isOnClustersPage) return null;

  return (
    <ShellBarAction
      icon="command-line-interfaces"
      text={t('terminal.name')}
      title={t('terminal.name')}
      onClick={async () => {
        const podName = await generateTerminalPodName(
          clusterServer,
          credential,
        );
        await createBusolaTerminalPod(fetchFn, setSession, image, podName);
        setShowTerminal((prev) => ({ ...prev, isOpen: !prev.isOpen }));
      }}
    />
  );
}
