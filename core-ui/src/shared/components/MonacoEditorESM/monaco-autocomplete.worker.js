/* eslint-disable no-restricted-globals */

import toJsonSchema from '@openapi-contrib/openapi-schema-to-json-schema';
import { Resolver } from '@stoplight/json-ref-resolver';

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

      if (!jsonSchemas[schemaId]) {
        jsonSchemas[schemaId] = value;
      }
    }
  });
}

self.onmessage = $event => {
  if ($event.data[0] === 'shouldInitialize') {
    self.postMessage({
      isInitialized: !!Object.values(jsonSchemas).length,
      mySchemas: jsonSchemas,
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
      self.postMessage({ error: new Error('No matching schema') });
    }
  }
};
