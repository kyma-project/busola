import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { createContext, useEffect, useState } from 'react';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import {
  sendWorkerMessage,
  addWorkerListener,
  addWorkerErrorListener,
} from './resourceSchemaWorkerInit';

export const AppContext = createContext({ areSchemasComputed: false });

export const useResourceSchemas = () => {
  const fetch = useSingleGet();
  const { activeClusterName, authData } = useMicrofrontendContext();
  const [areSchemasComputed, setAreSchemasComputed] = useState(false);
  const [schemasError, setSchemasError] = useState(null);

  useEffect(() => {
    if (!activeClusterName || !authData?.token) return;
    fetch('/openapi/v2')
      ?.then(res => res.json())
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
  }, [activeClusterName, setAreSchemasComputed, authData?.token]);

  return { areSchemasComputed, schemasError };
};
