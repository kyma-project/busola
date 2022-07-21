import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { createContext, useEffect, useState } from 'react';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import {
  sendMessage,
  messageListener,
} from './openapiToJsonWorkerCommunicator';

export const AppContext = createContext({ areSchemasComputed: false });

export const useOpenapiToJson = () => {
  const fetch = useSingleGet();
  const { activeClusterName } = useMicrofrontendContext();
  const [areSchemasComputed, setAreSchemasComputed] = useState(false);

  useEffect(() => {
    fetch('/openapi/v2')
      .then(res => res.json())
      .then(data => {
        sendMessage('sendingOpenapi', data, activeClusterName);
      })
      .catch(err => {
        console.error(err);
      });

    messageListener('error', err => {
      console.error(err);
    });

    messageListener('initialized', () => {
      setAreSchemasComputed(true);
    });

    // fetch not included
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeClusterName, setAreSchemasComputed]);

  return { areSchemasComputed };
};
