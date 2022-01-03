import { useEffect, useRef, useState } from 'react';
import * as jp from 'jsonpath';
import toJsonSchema from '@openapi-contrib/openapi-schema-to-json-schema';
import { Resolver } from '@stoplight/json-ref-resolver';
import Ajv from 'ajv';
import { useSingleGet } from 'react-shared';
import pluralize from 'pluralize';

// eslint-disable-next-line import/no-webpack-loader-syntax
import EditorWorker from 'worker-loader!monaco-editor/esm/vs/editor/editor.worker.js';
// eslint-disable-next-line import/no-webpack-loader-syntax
import JSONWorker from 'worker-loader!monaco-editor/esm/vs/language/json/json.worker.js';
// eslint-disable-next-line import/no-webpack-loader-syntax
import YamlWorker from 'worker-loader!monaco-yaml/lib/esm/yaml.worker.js';
// eslint-disable-next-line import/no-webpack-loader-syntax
import MonacoYamlWorker from 'worker-loader!./monaco-yaml-worker';

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
if (typeof Worker !== 'undefined') {
  window.schemasWorker = new MonacoYamlWorker();

  window.schemasWorker.postMessage('initiate');
}

function createAjv(schema) {
  const ajv = new Ajv({
    formats: {
      int64: 'number',
      int32: 'number',
      'int-or-string': x => typeof x === 'number' || typeof x === 'string',
      'date-time': 'string',
    },
    strictSchema: 'log',
  });
  Object.values(schema.result.definitions).forEach(value => {
    if (value['x-kubernetes-group-version-kind']) {
      const { group, kind, version } = value[
        'x-kubernetes-group-version-kind'
      ][0];
      const key = `${group}/${version}/${pluralize(kind)}`;
      if (!ajv.getSchema(key)) {
        ajv.addSchema(value, key);
      }
    }
  });

  return ajv;
}

export function useEditorHelper(value) {
  const fetch = useSingleGet();
  const [schema, setSchema] = useState(null);

  const initialApiUrlRef = useRef(null);
  useEffect(() => {
    //this gets calculated only once for the initial value
    //the json schema is fetched only then
    if (!initialApiUrlRef.current) {
      initialApiUrlRef.current = `${jp.value(value, '$.apiVersion')}/${jp.value(
        value,
        '$.kind',
      )}s`;
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (schema && initialApiUrlRef.current) {
      return;
    }

    async function fetchOpenApiSchema() {
      //fetch openApi
      const response = await fetch('/openapi/v2');
      const data = await response.json();

      // console.log('kkii', window.schemasWorker);
      // window.schemasWorker.postMessage(data);

      //translate openApi to JSON
      const resolved = await new Resolver().resolve(data);
      const schema = toJsonSchema(resolved);

      //create schemas understandable by Monaco
      const ajv = createAjv(schema);
      const validator = ajv.getSchema(initialApiUrlRef.current);
      if (validator?.schema) {
        setSchema(validator.schema);
      }
    }
    fetchOpenApiSchema().catch(err => {
      console.log(err);
    });
    // eslint-disable-next-line
  }, [setSchema]);

  return { schema };
}
