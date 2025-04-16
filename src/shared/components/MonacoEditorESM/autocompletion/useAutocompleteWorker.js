import { useCallback, useState } from 'react';
import { Uri } from 'monaco-editor';
import { setDiagnosticsOptions } from 'monaco-yaml';
import { useGetSchema } from 'hooks/useGetSchema';
import { v4 as uuid } from 'uuid';
import YamlWorker from './yaml.worker.js?worker';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

window.MonacoEnvironment = {
  getWorker: function(workerId, label) {
    switch (label) {
      case 'json':
        return new JsonWorker();
      case 'yaml':
        return new YamlWorker();
      case 'typescript':
      case 'javascript':
        return new TsWorker();
      default:
        return new EditorWorker();
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
  schema: predefinedSchema,
}) {
  const [schemaId] = useState(predefinedSchemaId || Math.random().toString());

  if (!autocompletionDisabled && !predefinedSchemaId) {
    console.warn(
      'useAutocompleteWorker: autocompletion is on, but no `predefinedSchemaId` provided. Disabling autocompletion.',
    );
    autocompletionDisabled = true;
  }

  const { schema: fetchedSchema, loading, error } = useGetSchema({
    schemaId,
    skip: autocompletionDisabled || !!predefinedSchema,
  });

  const schema = predefinedSchema || fetchedSchema;
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
