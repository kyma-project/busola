import { useEffect, useState, useMemo } from 'react';
import { mapValues } from 'lodash';
import {
  addWorkerListener,
  sendWorkerMessage,
  addWorkerErrorListener,
  isWorkerAvailable,
} from 'components/App/resourceSchemas/resourceSchemaWorkerApi';
import { useRecoilValue } from 'recoil';
import { schemaWorkerStatusState } from 'state/schemaWorkerStatusAtom';

export const useGetSchema = ({ schemaId, skip, resource }) => {
  if (!schemaId && resource) {
    const { group, version, kind } = resource;
    if (!group) schemaId = `${version}/${kind}`;
    else schemaId = `${group}/${version}/${kind}`;
  }

  const { areSchemasComputed, schemasError } = useRecoilValue(
    schemaWorkerStatusState,
  );

  const isWorkerOkay = isWorkerAvailable && !schemasError;
  const [schema, setSchema] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!isWorkerOkay ? false : !skip);

  useEffect(() => {
    if (!areSchemasComputed || schema || skip || !isWorkerOkay) {
      return;
    }
    sendWorkerMessage('getSchema', schemaId);

    addWorkerListener(`schemaComputed:${schemaId}`, ({ schema }) => {
      setSchema(schema);
      setError(null);
      setLoading(false);
    });
    addWorkerListener('customError', err => {
      setError(err);
      setLoading(false);
    });
    addWorkerErrorListener(err => {
      setError(err);
      setLoading(false);
    });
  }, [areSchemasComputed, schemaId, setSchema, schema, skip, isWorkerOkay]);

  return { schema, error, loading };
};

// TODO error/loading
export const useResourceSchemas = resources => {
  const schemaIds = useMemo(
    () =>
      mapValues(resources, resource => {
        const { group, version, kind } = resource;
        if (!group) return `${version}/${kind}`;
        else return `${group}/${version}/${kind}`;
      }),
    [resources],
  );

  const { areSchemasComputed, schemasError } = useRecoilValue(
    schemaWorkerStatusState,
  );

  const isWorkerOkay = isWorkerAvailable && !schemasError;
  const [schemas, setSchemas] = useState({});
  const setSchema = (schemaId, schema) =>
    setSchemas(schemas => ({
      ...schemas,
      [schemaId]: schema,
    }));
  // TODO
  //
  // const [error, setError] = useState(null);
  // const [loading, setLoading] = useState(!isWorkerOkay ? false : !skip);
  // const [loading, setLoading] = useState([]);

  useEffect(() => {
    const hasSchemas = Object.keys(schemaIds).every(
      schemaId => schemas.schemaId,
    );
    if (!areSchemasComputed || hasSchemas || !isWorkerOkay) {
      return;
    }

    Object.entries(schemaIds).forEach(([key, schemaId]) => {
      sendWorkerMessage('getSchema', schemaId);

      addWorkerListener(`schemaComputed:${schemaId}`, ({ schema }) => {
        setSchema(key, schema);
        // TODO
        // setError(null);
        // setLoading(false);
      });
    });
    // TODO
    // addWorkerListener('customError', err => {
    // setError(err);
    // setLoading(false);
    // });
    // addWorkerErrorListener(err => {
    // setError(err);
    // setLoading(false);
    // });
    // }, [areSchemasComputed, schemaIds, setSchemas, schemas, isWorkerOkay]);
  }, [areSchemasComputed, schemas.schemaId, schemaIds, isWorkerOkay]);

  return {
    schemas,
    // TODO
    // loading: Object.values(loading).some(v => !!v),
  };
};
