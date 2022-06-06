/* eslint-disable no-restricted-globals */

import toJsonSchema from '@openapi-contrib/openapi-schema-to-json-schema';
import { Resolver } from '@stoplight/json-ref-resolver';
import * as jp from 'jsonpath';

function findObjectsPaths(obj, key, val, path = '') {
  var objects = [];
  for (var i in obj) {
    if (!obj.hasOwnProperty(i)) continue;
    if (typeof obj[i] === 'object') {
      objects = objects.concat(
        findObjectsPaths(obj[i], key, val, path ? `${path}.${i}` : i),
      );
    } else if ((i === key && obj[i] === val) || (i === key && val === '')) {
      objects.push(path);
    }
  }
  return objects;
}

function replaceObjects(paths, schema) {
  for (var i in paths) {
    const object = {
      ...jp.value(schema, `$.${paths[i]}`),
      oneOf: [{ type: 'string' }, { type: 'number' }],
    };
    delete object.type;
    jp.value(schema, `$.${paths[i]}`, object);
    return schema;
  }
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
      const intOrStringPaths = findObjectsPaths(
        partialSchema,
        'format',
        'int-or-string',
      );
      const modifiedSchema = replaceObjects(intOrStringPaths, partialSchema);

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
