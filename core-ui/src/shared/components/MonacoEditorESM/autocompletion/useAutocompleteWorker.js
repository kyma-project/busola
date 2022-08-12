import { useCallback, useState } from 'react';
import { Uri } from 'monaco-editor';
import { setDiagnosticsOptions } from 'monaco-yaml';
import { useGetSchema } from 'hooks/useGetSchema';
import { v4 as uuid } from 'uuid';

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

const schemas = [];
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
  readOnly,
  language,
}) {
  // schemaId gets calculated only once, to find the json validation schema by a key
  // it means each supported resource must have apiVersion and kind initially defined
  // if it's not possible, pass the additional prop customSchemaId.
  // if none of the values is provided, the schemaId will be randomized (Monaco uses this
  // value as a model id and model stores information on editor's value, language etc.)
  const [schemaId] = useState(customSchemaId || getDefaultSchemaId(value));

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

    if (schema) {
      schemas.push({
        //this is a fake address that must be unique for different resources, otherwise the schemas will get mixed up
        uri: `file://kubernetes.io/${uuid()}`,
        fileMatch: [String(modelUri)],
        schema: schema || {},
      });
    }

    setDiagnosticsOptions({
      enableSchemaRequest: false,
      hover: true,
      completion: !!schema && !readOnly,
      validate: true,
      format: true,
      isKubernetes: true,
      schemas: schemas,
    });

    return {
      modelUri,
    };
  }, [schema, schemaId, readOnly]);

  return {
    setAutocompleteOptions,
    error,
    loading,
  };
}
