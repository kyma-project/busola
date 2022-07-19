import { createContext, useContext, useEffect, useState } from 'react';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { useMicrofrontendContext } from './MicrofrontendContext';

const K8sSchemaContext = createContext({});

// initiate a web worker that will prepare the templates, to keep the main thread free.
let schemasWorker = null;
if (typeof Worker !== 'undefined') {
  schemasWorker = new Worker(
    new URL('./monaco-autocomplete.worker.js', import.meta.url),
    { type: 'module' },
  );
}

export function K8sSchemaContextProvider({ children }) {
  const [schemas, setSchemas] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState();
  const [schemaIds, setSchemaIds] = useState([]);
  const fetch = useSingleGet();

  const clusterName = 'kmain';

  useEffect(() => {
    if (typeof Worker === 'undefined') {
      setLoading(false);
      setError(new Error("Browser doesn't support web workers"));
      return;
    }

    schemasWorker.postMessage(['shouldInitialize']);
    schemasWorker.onmessage = e => {
      if (e.data.isInitialized === false) {
        fetch('/openapi/v2')
          .then(res => res.json())
          .then(data => {
            schemasWorker.postMessage(['initialize', data]);
          })
          .catch(err => {
            console.error(err);
            setError(new Error("Server didn't send specification."));
            setLoading(false);
          });
        return;
      }

      if (e.data.isInitialized === true) {
        schemasWorker.postMessage(['getSchemas', schemaIds]);
        return;
      }
      if (e.data.schema) {
        const { schemaId, schema } = e.data.schema;
        setSchemas(schemas => ({ ...schemas, [schemaId]: schema }));
      }
      if (e.data.error) {
        setError(e.data.error);
      }
      setLoading(false);
    };

    schemasWorker.onerror = e => {
      setError(e);
      setLoading(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemaIds]);

  const value = {
    schemas,
    loading,
    error,
    requestSchema: schemaId => {
      if (!schemaIds.includes(schemaId)) {
        setSchemaIds([...schemaIds, schemaId]);
      }
    },
  };

  return (
    <K8sSchemaContext.Provider value={value}>
      {children}
    </K8sSchemaContext.Provider>
  );
}

export function useK8sSchemaContext() {
  return useContext(K8sSchemaContext);
}

export function useK8sSchema(schemaId) {
  const { error, loading, schemas, requestSchema } = useK8sSchemaContext();

  useEffect(() => {
    requestSchema(schemaId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schemaId]);

  return { schema: schemas[schemaId], loading, error };
}
