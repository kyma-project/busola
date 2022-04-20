import { useCallback, useEffect, useState } from 'react';
import { useSingleGet } from 'shared/hooks/BackendAPI/useGet';
import { Uri } from 'monaco-editor';
import { setDiagnosticsOptions } from 'monaco-yaml';

window.MonacoEnvironment = {
  getWorker(moduleId, label) {
    switch (label) {
      case 'editorWorkerService':
        return new Worker(
          new URL('monaco-editor/esm/vs/editor/editor.worker', import.meta.url),
        );
      case 'yaml':
        return new Worker(new URL('monaco-yaml/yaml.worker', import.meta.url), {
          type: 'module',
        });
      case 'json':
        return new Worker(
          new URL(
            'monaco-editor/esm/vs/language/json/json.worker',
            import.meta.url,
          ),
          { type: 'module' },
        );
      default:
        throw new Error(`Unknown label ${label}`);
    }
  },
};
// initiate own web worker to prepare the templates
let schemasWorker = null;
if (typeof Worker !== 'undefined') {
  schemasWorker = new Worker(
    new URL('./monaco-autocomplete.worker.js', import.meta.url),
    { type: 'module' },
  );
}
// each hook instance has access to this variable (a sort of global state)
const schemas = [];

export function useAutocompleteWorker({ value }) {
  const [schema, setSchema] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetch = useSingleGet();

  const { apiVersion, kind } = value;
  // this gets calculated only once, to fetch the json validation schema
  // it means each supported resource must have apiVersion and kind initially defined
  const [schemaId] = useState(`${apiVersion}/${kind}`);

  useEffect(() => {
    schemasWorker.postMessage(['shouldInitialize']);
    schemasWorker.onmessage = e => {
      if (e.data.isInitialized === false) {
        fetch('/openapi/v2')
          .then(res => res.json())
          .then(data => {
            schemasWorker.postMessage(['initialize', data]);
          });
        return;
      }

      if (e.data.isInitialized === true) {
        schemasWorker.postMessage(['getSchema', schemaId]);
        return;
      }
      if (e.data[schemaId]) {
        setSchema(e.data[schemaId]);
      }
      if (e.data.error) {
        setError(e.data.error);
      }
      setLoading(false);
    };

    schemasWorker.onerror = e => {
      setError(e);
      setSchema(null);
      setLoading(false);
    };

    // disabling due to the changing identity of fetch
    // eslint-disable-next-line
  }, [schemaId]);

  const setAutocompleteOptions = useCallback(() => {
    const modelUri = Uri.parse(schemaId);

    if (schema) {
      if (schemas.every(el => el.fileMatch[0] !== String(modelUri))) {
        schemas.push({
          // uri: apiLink, // TODO - custom link would make a lot of sense, but it creates problems (a query is sent),
          uri: 'https://kubernetes.io/docs',
          fileMatch: [String(modelUri)],
          schema: schema,
        });
      }
    }
    setDiagnosticsOptions({
      enableSchemaRequest: false,
      hover: true,
      completion: !!schema,
      validate: true,
      format: true,
      isKubernetes: true,
      schemas: schemas,
    });
    return {
      modelUri,
    };
  }, [schema, schemaId]);

  return { setAutocompleteOptions, schema, error, loading };
}
