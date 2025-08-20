import { useEffect } from 'react';
import { useMatch, useNavigate } from 'react-router';
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

export const useResourceSchemas = () => {
  const { cluster: activeClusterName } = useUrl();
  const authData = useAtomValue(authDataAtom);
  const openApi = useAtomValue(openapiAtom);
  const navigate = useNavigate();
  const cluster = useAtomValue(clusterAtom);
  const isClusterList = useMatch({ path: '/clusters' });
  const notification = useNotification();
  const { t } = useTranslation();
  const clusterInfo = useClustersInfo();
  const { currentCluster } = clusterInfo;

  const setSchemasState = useSetAtom(schemaWorkerStatusAtom);
  const [lastFetched, setLastFetched] = useAtom(openapiLastFetchedAtom);

  useEffect(() => {
    if (
      authData &&
      activeClusterName === cluster?.contextName &&
      openApi?.state === 'hasError' &&
      !isClusterList
    ) {
      notification.notifyError({
        content: t('clusters.messages.connection-failed'),
      });
      navigate('/clusters');
    }
  }, [
    activeClusterName,
    cluster?.contextName,
    authData,
    openApi,
    isClusterList,
    navigate,
    t,
    notification,
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
