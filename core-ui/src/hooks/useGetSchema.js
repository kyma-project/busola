import { useContext, useEffect, useState } from 'react';
import { AppContext } from 'components/App/resourceSchemas/useOpenapiToJson';
import {
  messageListener,
  sendMessage,
} from 'components/App/resourceSchemas/openapiToJsonWorkerCommunicator';

export const useGetSchema = ({ schemaId, skip }) => {
  const areSchemasComputed = useContext(AppContext).areSchemasComputed;
  const [schema, setSchema] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(!skip);

  useEffect(() => {
    if (!areSchemasComputed || schema || skip) {
      return;
    }

    sendMessage('getSchema', schemaId);
    messageListener('schemaDelivery', ({ schema, error }) => {
      if (error) {
        setLoading(false);
        setError(error);
        setSchema(null);
        console.error(error);
      } else {
        setLoading(false);
        setError(null);
        setSchema(schema);
      }
    });
  }, [areSchemasComputed, schemaId, setSchema, schema, skip]);

  return { schema, error, loading };
};
