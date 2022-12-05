import { useEffect, useState } from 'react';
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
    schemaId = `${group}/${version}/${kind}`;
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
