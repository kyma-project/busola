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

export function useAutocompleteWorker({
  value,
  schemaId: predefinedSchemaId,
  autocompletionDisabled,
  readOnly,
  language,
}) {
  const [schemaId] = useState(predefinedSchemaId || Math.random().toString());

  if (!autocompletionDisabled && !predefinedSchemaId) {
    console.warn(
      'useAutocompleteWorker: autocompletion is on, but no `predefinedSchemaId` provided. Disabling autocompletion.',
    );
    autocompletionDisabled = true;
  }

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
        //by monaco-yaml docs, this is not only uri but also a name that must be unique. Resources with the same uri will share one schema.
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
