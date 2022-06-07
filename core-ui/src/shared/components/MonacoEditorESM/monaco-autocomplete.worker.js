/* eslint-disable no-restricted-globals */

import toJsonSchema from '@openapi-contrib/openapi-schema-to-json-schema';
import { Resolver } from '@stoplight/json-ref-resolver';
import * as jp from 'jsonpath';

const CUSTOM_KEY = 'format';
const CUSTOM_FORMATS = {
  'int-or-string': { oneOf: [{ type: 'string' }, { type: 'number' }] },
  'date-time': { type: 'string' },
  int32: { type: 'number' },
  int64: { type: 'number' },
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
async function createJSONSchemas(openAPISchemas) {
  const resolved = await new Resolver().resolve(openAPISchemas);
  const schema = toJsonSchema(resolved);
  Object.values(schema.result.definitions).forEach(value => {
    if (value['x-kubernetes-group-version-kind']) {
      const { group, kind, version } = value[
        'x-kubernetes-group-version-kind'
      ][0];
      const prefix = group ? `${group}/` : '';
      const schemaId = `${prefix}${version}/${kind}`;
      const partialSchema = JSON.parse(JSON.stringify(value));
      const existingCustomFormats = getExistingCustomFormats(partialSchema);
      const modifiedSchema = replaceObjects(
        existingCustomFormats,
        partialSchema,
      );

      if (!jsonSchemas[schemaId]) {
        jsonSchemas[schemaId] = modifiedSchema;
      }
    }
  });
}

self.onmessage = $event => {
  if ($event.data[0] === 'shouldInitialize') {
    self.postMessage({
      isInitialized: !!Object.values(jsonSchemas).length,
    });
  }
  if ($event.data[0] === 'initialize') {
    createJSONSchemas($event.data[1])
      .then(() => {
        self.postMessage({
          isInitialized: !!Object.values(jsonSchemas).length,
        });
      })
      .catch(err => {
        console.error(err);
        self.postMessage({
          error: err,
        });
      });
  }
  if ($event.data[0] === 'getSchema') {
    const schema = jsonSchemas[$event.data[1]];

    if (schema) {
      self.postMessage({ [$event.data[1]]: schema });
    } else {
      self.postMessage({ error: new Error('Resource schema not found') });
    }
  }
};
