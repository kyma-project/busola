import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useEffect, useRef, useState } from 'react';
import {
  sendWorkerMessage,
  addWorkerListener,
  addWorkerErrorListener,
  terminateWorker,
} from './resourceSchemaWorkerApi';

export const useResourceSchemas = () => {
  const { activeClusterName, authData, openApi } = useMicrofrontendContext();
  const [areSchemasComputed, setAreSchemasComputed] = useState(false);
  const [schemasError, setSchemasError] = useState(null);
  const lastFetched = useRef();

  useEffect(() => {
    if (!activeClusterName || !authData) {
      setSchemasError(null);
      setAreSchemasComputed(false);
      lastFetched.current = null;
      return;
    }

    // Luigi updates authData a few times during a cluster load. The below line cancels repeated requests after the first fetch
    if (lastFetched.current === activeClusterName) return;
    lastFetched.current = activeClusterName;

    sendWorkerMessage('sendingOpenapi', openApi, activeClusterName);

    addWorkerListener('computedToJSON', () => {
      setAreSchemasComputed(true);
    });

    addWorkerListener('customError', err => {
      setSchemasError(err);
      console.error(err);
    });

    addWorkerErrorListener(err => {
      setSchemasError(err);
      console.error(err);
    });

    // fetch not included
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClusterName, setAreSchemasComputed, authData, openApi]);

  useEffect(() => {
    return () => {
      terminateWorker();
    };
  }, []);

  return { areSchemasComputed, schemasError };
};
