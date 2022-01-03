import { useEffect, useRef, useState } from 'react';
import * as jp from 'jsonpath';
import toJsonSchema from '@openapi-contrib/openapi-schema-to-json-schema';
import { Resolver } from '@stoplight/json-ref-resolver';
import Ajv from 'ajv';
import { useSingleGet } from 'react-shared';
import pluralize from 'pluralize';

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
  console.log(schema);
  return { schema };
}
