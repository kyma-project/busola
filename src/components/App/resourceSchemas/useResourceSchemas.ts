import { useEffect } from 'react';
import { useMatch } from 'react-router';
import { useNavigate } from 'react-router-dom';
import {
  sendWorkerMessage,
  addWorkerListener,
  addWorkerErrorListener,
  terminateWorker,
} from './resourceSchemaWorkerApi';
import {
  useRecoilValue,
  useRecoilValueLoadable,
  useRecoilState,
  useSetRecoilState,
} from 'recoil';
import { schemaWorkerStatusState } from 'state/schemaWorkerStatusAtom';
import { useUrl } from 'hooks/useUrl';
import { authDataState } from 'state/authDataAtom';
import { openapiState } from 'state/openapi/openapiSelector';
import { openapiLastFetchedState } from 'state/openapi/openapiLastFetchedAtom';
import { clusterState } from 'state/clusterAtom';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';

export const useResourceSchemas = () => {
  const { cluster: activeClusterName } = useUrl();
  const authData = useRecoilValue(authDataState);
  const openApi = useRecoilValueLoadable(openapiState);
  const navigate = useNavigate();
  const cluster = useRecoilValue(clusterState);
  const isClusterList = useMatch({ path: '/clusters' });
  const notification = useNotification();
  const { t } = useTranslation();

  const setSchemasState = useSetRecoilState(schemaWorkerStatusState);
  const [lastFetched, setLastFetched] = useRecoilState(openapiLastFetchedState);

  useEffect(() => {
    console.log(authData);
    console.log(activeClusterName);
    console.log(cluster?.contextName);
    console.log(openApi?.state);
    console.log(isClusterList);
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
    openApi.state,
    isClusterList,
    navigate,
    t,
    notification,
  ]);

  useEffect(() => {
    const isOngoingClusterChange = !activeClusterName || !authData;
    if (isOngoingClusterChange) {
      setSchemasState({ areSchemasComputed: false, schemasError: null });
      setLastFetched(null);
      return;
    }

    // Luigi updates authData a few times during a cluster load. The below line cancels repeated requests after the first fetch
    if (lastFetched === activeClusterName) return;
    if (openApi.state !== 'hasValue') return;

    setLastFetched(activeClusterName);
    sendWorkerMessage('sendingOpenapi', openApi.contents, activeClusterName);

    addWorkerListener('computedToJSON', () => {
      setSchemasState({ areSchemasComputed: true, schemasError: null });
    });

    addWorkerListener('customError', (err: Error) => {
      setSchemasState({ areSchemasComputed: false, schemasError: err });
      console.error(err);
    });

    addWorkerErrorListener((err: Error) => {
      setSchemasState({ areSchemasComputed: false, schemasError: err });
      console.error(err);
    });
  }, [
    activeClusterName,
    authData,
    openApi.state,
    openApi.contents,
    lastFetched,
    setSchemasState,
    setLastFetched,
  ]);

  useEffect(() => {
    return () => {
      terminateWorker();
    };
  }, []);
};
