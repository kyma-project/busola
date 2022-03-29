import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import LuigiClient from '@luigi-project/client';

import { useNotification } from 'shared/contexts/NotificationContext';

export const MicrofrontendContext = createContext({});

export function MicrofrontendContextProvider({ children }) {
  const [context, setContext] = useState({});
  const lastContext = useRef({});
  const notification = useNotification();

  useEffect(() => {
    const initHandle = LuigiClient.addInitListener(handleContextChanged);
    const updateHandle = LuigiClient.addContextUpdateListener(
      handleContextChanged,
    );
    const customMessageHandle = LuigiClient.addCustomMessageListener(
      'busola.showMessage',
      handleCustomMessage,
    );
    return () => {
      LuigiClient.removeContextUpdateListener(updateHandle);
      LuigiClient.removeInitListener(initHandle);
      LuigiClient.removeCustomMessageListener(customMessageHandle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context]);

  function handleContextChanged(newContext) {
    // Luigi fires the initListener multiple times with the same value (but different reference) for some reason
    if (JSON.stringify(lastContext.current) !== JSON.stringify(newContext)) {
      lastContext.current = newContext;
      setContext(newContext);
    }
  }

  function handleCustomMessage({ message, title, type }) {
    type.toLowerCase() === 'error'
      ? notification.notifyError({
          title,
          content: message,
        })
      : notification.notifySuccess({
          content: message,
        });
  }

  return (
    <MicrofrontendContext.Provider value={context}>
      {children}
    </MicrofrontendContext.Provider>
  );
}

export function useMicrofrontendContext() {
  return useContext(MicrofrontendContext);
}
