/* eslint-disable no-restricted-globals */

import toJsonSchema from '@openapi-contrib/openapi-schema-to-json-schema';
import { Resolver } from '@stoplight/json-ref-resolver';
import * as jp from 'jsonpath';

const CUSTOM_KEY = 'format';
const CUSTOM_FORMATS = {
  'int-or-string': { oneOf: [{ type: 'string' }, { type: 'integer' }] },
  'date-time': { type: 'string' },
  int32: { type: 'integer' },
  int64: { type: 'integer' },
};

function getExistingCustomFormats(obj, path = '') {
  let existingData = [];

  for (let i in obj) {
    if (!obj.hasOwnProperty(i)) continue;
    if (typeof obj[i] === 'object') {
      existingData = existingData.concat(
        getExistingCustomFormats(obj[i], path ? `${path}.${i}` : i),
      );
    } else if (i === CUSTOM_KEY) {
      for (let formatKey of Object.keys(CUSTOM_FORMATS)) {
        if (formatKey === obj[i]) {
          existingData.push({ path, formatKey });
          break;
        }
      }
    }
  }
  return existingData;
}

function replaceObjects(existingCustomFormats, schema) {
  for (let i in existingCustomFormats) {
    let object = {
      ...jp.value(schema, `$.${existingCustomFormats[i].path}`),
    };
    delete object.type;
    object = {
      ...object,
      ...CUSTOM_FORMATS[existingCustomFormats[i].formatKey],
    };
    jp.value(schema, `$.${existingCustomFormats[i].path}`, object);
  }
  return schema;
}

const jsonSchemas = {};
let activeClusterName = '';
async function createJSONSchemas(openAPISchemas, clusterName) {
  activeClusterName = clusterName;

  if (jsonSchemas[clusterName]) {
    return;
  }

  const resolved = await new Resolver().resolve(openAPISchemas);
  const schema = toJsonSchema(resolved);
  jsonSchemas[clusterName] = {};

  Object.values(schema.result.definitions).forEach(definition => {
    if (definition['x-kubernetes-group-version-kind']) {
      const { group, kind, version } = definition[
        'x-kubernetes-group-version-kind'
      ][0];
      const prefix = group ? `${group}/` : '';
      const schemaId = `${prefix}${version}/${kind}`;

      if (!jsonSchemas[clusterName][schemaId]) {
        jsonSchemas[clusterName][schemaId] = definition;
      }
    }
  });
}

self.onmessage = $event => {
  const message = $event.data[0];

  if (message === 'sendingOpenapi') {
    const openApiData = $event.data[1];
    const activeClusterName = $event.data[2];

    if (!openApiData || !activeClusterName) throw new Error();

    createJSONSchemas(openApiData, activeClusterName)
      .then(() => {
        self.postMessage({
          type: 'computedToJSON',
        });
      })
      .catch(err => {
        console.error(err);
        self.postMessage({
          type: 'customError',
          error: err,
        });
      });
  }

  if ($event.data[0] === 'getSchema') {
    const schemaId = JSON.parse(
      JSON.stringify(jsonSchemas[activeClusterName][$event.data[1]]),
    );
    const existingCustomFormats = getExistingCustomFormats(schemaId);
    const schemaCustomFormatsResolved = replaceObjects(
      existingCustomFormats,
      schemaId,
    );
    if (schemaCustomFormatsResolved) {
      self.postMessage({
        type: 'schemaComputed',
        schema: schemaCustomFormatsResolved,
      });
    } else {
      self.postMessage({
        type: 'customError',
        error: new Error('Resource schema not found'),
      });
    }
  }
};
