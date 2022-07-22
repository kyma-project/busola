import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { useEffect, useRef, useState } from 'react';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import {
  sendWorkerMessage,
  addWorkerListener,
  addWorkerErrorListener,
  schemasWorker,
} from './resourceSchemaWorkerApi';

export const useResourceSchemas = () => {
  const fetch = useSingleGet();
  const { activeClusterName, authData } = useMicrofrontendContext();
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

    fetch('/openapi/v2')
      .then(res => res.json())
      .then(data => {
        sendWorkerMessage('sendingOpenapi', data, activeClusterName);
      })
      .catch(err => {
        setSchemasError('unable to fetch /openapi/v2');
        console.error(err);
      });

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
  }, [activeClusterName, setAreSchemasComputed, authData]);

  useEffect(() => {
    return () => {
      schemasWorker?.terminate();
    };
  }, []);

  return { areSchemasComputed, schemasError };
};
