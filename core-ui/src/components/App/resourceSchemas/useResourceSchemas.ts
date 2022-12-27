import { useEffect, useRef } from 'react';
import { useMatch } from 'react-router';
import { useNavigate } from 'react-router-dom';
import {
  sendWorkerMessage,
  addWorkerListener,
  addWorkerErrorListener,
  terminateWorker,
} from './resourceSchemaWorkerApi';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { schemaWorkerStatusState } from 'state/schemaWorkerStatusAtom';
import { useUrl } from 'hooks/useUrl';
import { authDataState } from 'state/authDataAtom';
import { openapiState } from 'state/openapi/openapiSelector';
import { clusterState } from 'state/clusterAtom';

export const useResourceSchemas = () => {
  const { cluster: activeClusterName } = useUrl();
  const authData = useRecoilValue(authDataState);
  const openApi = useRecoilValue(openapiState);
  const navigate = useNavigate();
  const cluster = useRecoilValue(clusterState);
  const isClusterList = useMatch({ path: '/clusters' });

  const setSchemasState = useSetRecoilState(schemaWorkerStatusState);
  const lastFetched = useRef<string | null>(null);

  useEffect(() => {
    if (
      activeClusterName === cluster?.contextName &&
      openApi?.error &&
      !isClusterList
    ) {
      // TODO message
      navigate('/clusters');
    }
  }, [activeClusterName, openApi]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    // const isOngoingClusterChange = !activeClusterName || !authData;
    // if (isOngoingClusterChange) {
    // setSchemasState({ areSchemasComputed: false, schemasError: null });
    // lastFetched.current = null;
    // return;
    // }

    // Luigi updates authData a few times during a cluster load. The below line cancels repeated requests after the first fetch
    // if (lastFetched.current === activeClusterName) return;
    // lastFetched.current = activeClusterName;

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
  }, [activeClusterName, authData, openApi, setSchemasState]);

  useEffect(() => {
    return () => {
      terminateWorker();
    };
  }, []);
};
