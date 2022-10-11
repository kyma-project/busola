import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useEffect, useRef } from 'react';
import {
  sendWorkerMessage,
  addWorkerListener,
  addWorkerErrorListener,
  terminateWorker,
} from './resourceSchemaWorkerApi';
import { useSetRecoilState } from 'recoil';
import { openapiSchemasState } from 'state/openapiSchemasAtom';

export const useResourceSchemas = () => {
  const { activeClusterName, authData, openApi } = useMicrofrontendContext();
  const setSchemasState = useSetRecoilState(openapiSchemasState);
  const lastFetched = useRef();

  useEffect(() => {
    if (!activeClusterName || !authData) {
      setSchemasState({ areSchemasComputed: false, schemasError: null });
      lastFetched.current = null;
      return;
    }

    // Luigi updates authData a few times during a cluster load. The below line cancels repeated requests after the first fetch
    if (lastFetched.current === activeClusterName) return;
    lastFetched.current = activeClusterName;

    sendWorkerMessage('sendingOpenapi', openApi, activeClusterName);

    addWorkerListener('computedToJSON', () => {
      setSchemasState({ areSchemasComputed: true, schemasError: null });
    });

    addWorkerListener('customError', err => {
      setSchemasState({ areSchemasComputed: false, schemasError: err });
      console.error(err);
    });

    addWorkerErrorListener(err => {
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
