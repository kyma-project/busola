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

export function useAutocompleteWorker({
  value,
  schemaId: predefinedSchemaId,
  autocompletionDisabled,
  customSchemaUri,
  readOnly,
  language,
}) {
  const [schemaId] = useState(predefinedSchemaId || Math.random().toString());
  const [schemaLink] = useState(getSchemaLink(value, language));

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
