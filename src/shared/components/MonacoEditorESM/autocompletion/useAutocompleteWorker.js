import { useCallback, useState } from 'react';
import { Uri } from 'monaco-editor';
import * as monaco from 'monaco-editor';
import { configureMonacoYaml } from 'monaco-yaml';
import { useGetSchema } from 'hooks/useGetSchema';
import YamlWorker from './yaml.worker.js?worker';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';
import TsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker';

window.MonacoEnvironment = {
  getWorker: function (_workerId, label) {
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

// Map to track schemas by schemaId to prevent unbounded growth
const schemasMap = new Map();

export function useAutocompleteWorker({
  schemaId: predefinedSchemaId,
  autocompletionDisabled,
  readOnly,
  schema: predefinedSchema,
}) {
  const [schemaId] = useState(predefinedSchemaId || Math.random().toString());
  // Use schemaId for URI to ensure same resource types share the same schema URI
  const schemaUri = `file://kubernetes.io/${schemaId}`;

  if (!autocompletionDisabled && !predefinedSchemaId) {
    console.warn(
      'useAutocompleteWorker: autocompletion is on, but no `predefinedSchemaId` provided. Disabling autocompletion.',
    );
    autocompletionDisabled = true;
  }

  const {
    schema: fetchedSchema,
    loading,
    error,
  } = useGetSchema({
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
      schemasMap.set(schemaId, {
        //by monaco-yaml docs, this is not only uri but also a name that must be unique. Resources with the same uri will share one schema.
        uri: schemaUri,
        fileMatch: [String(modelUri)],
        schema: schema || {},
      });
    }

    const schemas = Array.from(schemasMap.values());

    configureMonacoYaml(monaco, {
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

  const cleanupSchema = useCallback(() => {
    schemasMap.delete(schemaId);
  }, [schemaId]);

  return {
    setAutocompleteOptions,
    cleanupSchema,
    error,
    loading,
  };
}
