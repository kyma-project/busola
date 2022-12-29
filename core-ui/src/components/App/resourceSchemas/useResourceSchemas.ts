import { useEffect } from 'react';
import {
  sendWorkerMessage,
  addWorkerListener,
  addWorkerErrorListener,
  terminateWorker,
} from './resourceSchemaWorkerApi';
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil';
import { schemaWorkerStatusState } from 'state/schemaWorkerStatusAtom';
import { useUrl } from 'hooks/useUrl';
import { authDataState } from 'state/authDataAtom';
import { openapiState } from 'state/openapi/openapiSelector';
import { openapiLastFetchedState } from 'state/openapi/openapiLastFetchedAtom';

export const useResourceSchemas = () => {
  const { cluster: activeClusterName } = useUrl();
  const authData = useRecoilValue(authDataState);
  const openApi = useRecoilValue(openapiState);
  const setSchemasState = useSetRecoilState(schemaWorkerStatusState);
  const [lastFetched, setLastFetched] = useRecoilState(openapiLastFetchedState);

  useEffect(() => {
    const isOngoingClusterChange = !activeClusterName || !authData;
    if (isOngoingClusterChange) {
      setSchemasState({ areSchemasComputed: false, schemasError: null });
      setLastFetched(null);
      return;
    }

    // Luigi updates authData a few times during a cluster load. The below line cancels repeated requests after the first fetch
    if (lastFetched === activeClusterName) return;
    setLastFetched(activeClusterName);
    sendWorkerMessage('sendingOpenapi', openApi, activeClusterName);

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
    openApi,
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
