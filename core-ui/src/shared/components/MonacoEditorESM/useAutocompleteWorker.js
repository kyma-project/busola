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
// initiate a web worker that will prepare the templates, to keep the main thread free
let schemasWorker = null;
if (typeof Worker !== 'undefined') {
  schemasWorker = new Worker(
    new URL('./monaco-autocomplete.worker.js', import.meta.url),
    { type: 'module' },
  );
}
let activeSchemaPath = null;

export function useAutocompleteWorker({
  value,
  customSchemaId,
  autocompletionDisabled,
  customSchemaUri,
  readOnly,
}) {
  const [schema, setSchema] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const fetch = useSingleGet();

  const { apiVersion, kind } = value;
  // this gets calculated only once, to fetch the json validation schema
  // it means each supported resource must have apiVersion and kind initially defined
  // if it's not possible, pass the additional prop customSchemaId
  const [schemaId] = useState(customSchemaId || `${apiVersion}/${kind}`);
  useEffect(() => {
    if (autocompletionDisabled) {
      setLoading(false);
      return;
    }

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

    // disabling eslint due to the changing identity of fetch
    // eslint-disable-next-line
  }, [schemaId]);

  const setAutocompleteOptions = useCallback(() => {
    const modelUri = Uri.parse(schemaId);
    activeSchemaPath = modelUri.path;
    setDiagnosticsOptions({
      enableSchemaRequest: false,
      hover: true,
      completion: !!schema && !readOnly,
      validate: true,
      format: true,
      isKubernetes: true,
      schemas: [
        {
          uri:
            customSchemaUri ||
            'https://kubernetes.io/docs/concepts/overview/kubernetes-api',
          fileMatch: [String(modelUri)],
          schema: schema || {},
        },
      ],
    });
    return {
      modelUri,
    };
  }, [schema, schemaId, customSchemaUri, readOnly]);

  return { setAutocompleteOptions, activeSchemaPath, error, loading };
}
