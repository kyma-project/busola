import { createContext, useContext, useEffect, useState } from 'react';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { useMicrofrontendContext } from './MicrofrontendContext';

const K8sSchemaContext = createContext({});

export function K8sSchemaContextProvider({ children }) {
  const { cluster } = useMicrofrontendContext();
  const [state, setState] = useState(null);
  const fetch = useSingleGet();

  useEffect(() => {
    if (cluster) {
      setState(null);
      fetch('/openapi/v2')
        .then(res => res.json())
        .then(data => setState({ schema: data }))
        .catch(error => {
          console.warn(error);
          setState({ error });
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster?.cluster.server]);

  const value = { schema: state?.schema, error: state?.error };
  return (
    <K8sSchemaContext.Provider value={value}>
      {children}
    </K8sSchemaContext.Provider>
  );
}

export function useK8sSchema() {
  return useContext(K8sSchemaContext);
}
