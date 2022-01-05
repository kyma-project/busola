import { useCallback, useEffect, useState } from 'react';
import { useSingleGet } from 'react-shared';
import pluralize from 'pluralize';
import { Uri } from 'monaco-editor';
import { setDiagnosticsOptions } from 'monaco-yaml';

// eslint-disable-next-line import/no-webpack-loader-syntax
import EditorWorker from 'worker-loader!monaco-editor/esm/vs/editor/editor.worker.js';
// eslint-disable-next-line import/no-webpack-loader-syntax
import JSONWorker from 'worker-loader!monaco-editor/esm/vs/language/json/json.worker.js';
// eslint-disable-next-line import/no-webpack-loader-syntax
import YamlWorker from 'worker-loader!monaco-yaml/lib/esm/yaml.worker.js';
// eslint-disable-next-line import/no-webpack-loader-syntax
import MonacoYamlWorker from 'worker-loader!./monaco-yaml-worker.js';

// initialize Monaco Yaml by switching web-workers
window.MonacoEnvironment = {
  getWorker(moduleId, label) {
    switch (label) {
      case 'editorWorkerService':
        return new EditorWorker();
      case 'yaml':
        return new YamlWorker();
      case 'json':
        return new JSONWorker();
      default:
        throw new Error(`Unknown label ${label}`);
    }
  },
};
// initiate own web worker to prepare the templates
let schemasWorker = null;
if (typeof Worker !== 'undefined') {
  schemasWorker = new MonacoYamlWorker();
}
// each hook instance has access to this variable (a sort of global state)
const schemas = [];

export function useEditorHelper({ value }) {
  const [schema, setSchema] = useState(null);
  const fetch = useSingleGet();

  // this gets calculated only once, to fetch the json validation schema
  // it means each supported resource must have apiVersion and kind defined
  const [fileId] = useState(
    `${value.apiVersion || ''}/${pluralize(value.kind || '')}`,
  );

  useEffect(() => {
    schemasWorker.postMessage(['shouldInitialize']);
    schemasWorker.onmessage = e => {
      if (e.data.isInitialized === false) {
        fetch('/openapi/v2')
          .then(res => res.json())
          .then(data => {
            schemasWorker.postMessage(['initialize', data]);
          });
      }
      if (e.data.isInitialized === true) {
        schemasWorker.postMessage(['getSchema', fileId]);
      }
      if (e.data[fileId]) {
        setSchema(e.data[fileId]);
      }
    };

    return () => {
      // TODO clear schema from the schames array
    };
    // disabling due to the changing identity of fetch
    // eslint-disable-next-line
  }, [fileId]);

  const setAutocompleteOptions = useCallback(() => {
    const modelUri = Uri.parse(fileId);

    if (schema) {
      if (schemas.every(el => el.fileMatch[0] !== String(modelUri))) {
        schemas.push({
          uri: 'https://kubernetes.io/docs',
          fileMatch: [String(modelUri)],
          schema: schema,
        });
      }
    }

    setDiagnosticsOptions({
      enableSchemaRequest: true,
      hover: true,
      completion: true,
      validate: true,
      format: true,
      isKubernetes: true,
      schemas: schemas,
    });

    return {
      modelUri,
    };
  }, [schema, fileId]);

  return { setAutocompleteOptions, schema };
}
