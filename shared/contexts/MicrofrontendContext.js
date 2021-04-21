import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
import LuigiClient from '@luigi-project/client';

export const MicrofrontendContext = createContext({});

export function MicrofrontendContextProvider({ children }) {
  const [context, setContext] = useState({});
  const lastContext = useRef({});

  useEffect(() => {
    const initHandle = LuigiClient.addInitListener(handleContextChanged);
    const updateHandle = LuigiClient.addContextUpdateListener(
      handleContextChanged,
    );
    return () => {
      LuigiClient.removeContextUpdateListener(updateHandle);
      LuigiClient.removeInitListener(initHandle);
    };
  }, [context]);

  function handleContextChanged(newContext) {
    // Luigi fires the initListener multiple times with the same value (but different reference) for some reason
    if (JSON.stringify(lastContext.current) !== JSON.stringify(newContext)) {
      console.log((newContext.authData.idTokenExpiration - Date.now())/1000)
      lastContext.current = newContext;
      setContext(newContext);
    }
  }

  return (
    <MicrofrontendContext.Provider value={context}>
      {children}
    </MicrofrontendContext.Provider>
  );
}
export function useModuleEnabled(module) {
  const { backendModules } = useMicrofrontendContext();
  return backendModules && backendModules.includes(module);
}

export function useMicrofrontendContext() {
  return useContext(MicrofrontendContext);
}
