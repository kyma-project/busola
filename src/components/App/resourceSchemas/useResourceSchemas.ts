import { useEffect, useRef } from 'react';
import { useMatch } from 'react-router';
import {
  addWorkerErrorListener,
  addWorkerListener,
  sendWorkerMessage,
  terminateWorker,
} from './resourceSchemaWorkerApi';
import { useAtomValue } from 'jotai';
import { schemaWorkerStatusAtom } from 'state/schemaWorkerStatusAtom';
import { useUrl } from 'hooks/useUrl';
import { authDataAtom } from 'state/authDataAtom';
import { openapiAtom } from 'state/openapi/openapiAtom';
import { openapiLastFetchedAtom } from 'state/openapi/openapiLastFetchedAtom';
import { clusterAtom } from 'state/clusterAtom';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { useClustersInfo } from 'state/utils/getClustersInfo';
import { useAtom, useSetAtom } from 'jotai';
import { ssoDataAtom, useIsSSOEnabled } from 'state/ssoDataAtom';
import { renewingAtom } from 'state/renewingAtom';
import { useReauthenticate } from 'state/useReauthenticate';
import { authUserManagerRef } from 'state/authDataAtom';

export const useResourceSchemas = () => {
  const { cluster: activeClusterName } = useUrl();
  const authData = useAtomValue(authDataAtom);
  const ssoData = useAtomValue(ssoDataAtom);
  const openApi = useAtomValue(openapiAtom);
  const cluster = useAtomValue(clusterAtom);
  const isClusterList = useMatch({ path: '/clusters' });
  const notification = useNotification();
  const { t } = useTranslation();
  const clusterInfo = useClustersInfo();
  const { currentCluster } = clusterInfo;
  const isSSOEnabled = useIsSSOEnabled();
  const renewing = useAtomValue(renewingAtom);
  const reauth = useReauthenticate({ notifyError: notification.notifyError });
  // Blocks a second `reauth` call when the effect re-runs before the browser
  // navigates. Reset when we're no longer in the error branch.
  const reauthTriggeredRef = useRef(false);

  const setSchemasState = useSetAtom(schemaWorkerStatusAtom);
  const [lastFetched, setLastFetched] = useAtom(openapiLastFetchedAtom);

  useEffect(() => {
    if (openApi?.state !== 'hasError' || !authData) {
      reauthTriggeredRef.current = false;
    }
    if (
      authData &&
      activeClusterName === cluster?.contextName &&
      openApi?.state === 'hasError' &&
      !isClusterList &&
      // A 401 during a silent renew is transient, not a session drop.
      !renewing &&
      !reauthTriggeredRef.current
    ) {
      if (!isSSOEnabled || ssoData) {
        reauthTriggeredRef.current = true;
        notification.notifyError({
          content: t('clusters.messages.connection-failed'),
        });
        const um = authUserManagerRef.current;
        if (um) reauth(um);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeClusterName,
    cluster?.contextName,
    authData,
    openApi.state,
    isClusterList,
    t,
    ssoData,
    isSSOEnabled,
    renewing,
  ]);

  useEffect(() => {
    const isOngoingClusterChange =
      !currentCluster || !activeClusterName || !authData;

    if (isOngoingClusterChange) {
      setSchemasState({ areSchemasComputed: false, schemasError: null });
      setLastFetched(null);
      return;
    }

    // authData updates a few times during cluster load. The below line cancels repeated requests after the first fetch
    if (lastFetched === activeClusterName) return;
    if (openApi.state !== 'hasData') return;

    setLastFetched(activeClusterName);
    sendWorkerMessage('sendingOpenapi', openApi.data, activeClusterName);

    addWorkerListener('computedToJSON', () => {
      setSchemasState({ areSchemasComputed: true, schemasError: null });
    });

    addWorkerListener('customError', (err: Error) => {
      setSchemasState({ areSchemasComputed: false, schemasError: err });
      console.error(err);
    });

    if (!activeClusterName) return;
    addWorkerErrorListener((err: Error) => {
      setSchemasState({ areSchemasComputed: false, schemasError: err });
      console.error(err);
    });
  }, [
    activeClusterName,
    authData,
    openApi,
    lastFetched,
    setSchemasState,
    setLastFetched,
    currentCluster,
  ]);

  useEffect(() => {
    return () => {
      terminateWorker();
    };
  }, []);
};
