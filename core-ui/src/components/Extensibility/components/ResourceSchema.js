import React from 'react';

import { JsonSchemaForm } from './JSONSchemaForm';

const ResourceSchema = ({ schema, resource, setResource }) => {
  return (
    <JsonSchemaForm
      id="schemaDataForm"
      schema={schema}
      resource={resource}
      setResource={setResource}
    />
  );
};

export default ResourceSchema;
