import { useCallback, useState } from 'react';
import { Uri } from 'monaco-editor';
import { setDiagnosticsOptions } from 'monaco-yaml';
import { getSchemaLink } from './getSchemaLink';
import { useGetSchema } from 'hooks/useGetSchema';

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
  // schemaId gets calculated only once, to find the json validation schema by a key
  // it means each supported resource must have apiVersion and kind initially defined
  // if it's not possible, pass the additional prop customSchemaId.
  // if none of the values is provided, the schemaId will be randomized (Monaco uses this
  // value as a model id and model stores information on editor's value, language etc.)
  const [schemaId] = useState(customSchemaId || getDefaultSchemaId(value));
  const [schemaLink] = useState(getSchemaLink(value, language));

  const { schema, loading, error } = useGetSchema({
    schemaId,
    skip: autocompletionDisabled,
  });

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
