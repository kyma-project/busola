import { useContext, useEffect, useState } from 'react';
import { AppContext } from 'components/App/resourceSchemas/useOpenapiToJson';
import {
  messageListener,
  sendMessage,
} from 'components/App/resourceSchemas/openapiToJsonWorkerCommunicator';

export const useGetSchema = ({ schemaId, skip }) => {
  const areSchemasComputed = useContext(AppContext).areSchemasComputed;
  const [schema, setSchema] = useState(null);

  useEffect(() => {
    if (!areSchemasComputed || schema || skip) return;
    console.log(1111, schemaId);
    sendMessage('getSchema', schemaId);
    messageListener('schemaDelivery', ({ schema, error }) => {
      if (error) {
        console.error(error);
      } else {
        setSchema(schema);
      }
    });
  }, [areSchemasComputed, schemaId, setSchema, schema, skip]);

  return { schema };
};
