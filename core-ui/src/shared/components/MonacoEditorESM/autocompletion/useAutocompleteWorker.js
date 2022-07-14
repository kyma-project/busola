import { useCallback, useEffect, useState } from 'react';
import { Uri } from 'monaco-editor';
import { setDiagnosticsOptions } from 'monaco-yaml';
import { getSchemaLink } from './getSchemaLink';
import { useK8sSchema } from 'shared/contexts/K8sSchemaContext';

// todo mapa klaster - openapi
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
      case 'javascript':
      case 'typescript':
        return new Worker(
          new URL(
            'monaco-editor/esm/vs/language/typescript/ts.worker',
            import.meta.url,
          ),
        );
      default:
        throw new Error(`Unknown label ${label}`);
    }
  },
};
// initiate a web worker that will prepare the templates, to keep the main thread free.
let schemasWorker = null;
if (typeof Worker !== 'undefined') {
  schemasWorker = new Worker(
    new URL('./monaco-autocomplete.worker.js', import.meta.url),
    { type: 'module' },
  );
}
let activeSchemaPath = null;

const getDefaultSchemaId = resource => {
  const { apiVersion, kind } = resource || {};

  if (apiVersion && kind) {
    return `${apiVersion}/${kind}`;
  } else {
    return `${Math.random()}`;
  }
};

export function useAutocompleteWorker({
  value,
  customSchemaId,
  autocompletionDisabled,
  customSchemaUri,
  readOnly,
  language,
}) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // schemaId gets calculated only once, to find the json validation schema by a key
  // it means each supported resource must have apiVersion and kind initially defined
  // if it's not possible, pass the additional prop customSchemaId.
  // if none of the values is provided, the schemaId will be randomized (Monaco uses this
  // value as a model id and model stores information on editor's value, language etc.)
  const [schemaId] = useState(customSchemaId || getDefaultSchemaId(value));
  const [schemaLink] = useState(getSchemaLink(value, language));

  const { schema, error: schemaLoadingError } = useK8sSchema();

  useEffect(() => {
    if (schemaLoadingError && !error) {
      setError(schemaLoadingError);
    }
  }, [schemaLoadingError, error]);

  useEffect(() => {
    // parse OpenAPI schema to JSON Schemas (this is an expensive operation passed to a web worker)

    if (autocompletionDisabled) {
      setLoading(false);
      return;
    }

    if (typeof Worker === 'undefined') {
      setLoading(false);
      setError(new Error("Browser doesn't support web workers"));
      return;
    }
    if (!schema) return;

    schemasWorker.postMessage(['shouldInitialize']);
    schemasWorker.onmessage = e => {
      if (e.data.isInitialized === false) {
        console.log('sending schema', schema);
        schemasWorker.postMessage(['initialize', schema]);
        setLoading(false);
        return;
      }

      if (e.data.isInitialized === true) {
        schemasWorker.postMessage(['getSchema', schemaId]);
        return;
      }
      if (e.data[schemaId]) {
        console.log('tu bd schema', e.data[schemaId]);
        setSchema(e.data[schemaId]);
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

    // disabling eslint due to the changing identity of fetch
    // eslint-disable-next-line
  }, [schemaId, schema]);

  /**
   * Call this before initializing Monaco. This function alters Monaco global config to set up JSON-based
   * autocompletion.
   */
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
            schemaLink ||
            'https://kubernetes.io/docs/concepts/overview/kubernetes-api',
          fileMatch: [String(modelUri)],
          schema: schema || {},
        },
      ],
    });

    return {
      modelUri,
    };
  }, [schema, schemaId, schemaLink, customSchemaUri, readOnly]);

  return { setAutocompleteOptions, activeSchemaPath, error, loading };
}
