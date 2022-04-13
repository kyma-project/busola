import React from 'react';

import { JsonSchemaForm } from './JSONSchemaForm';

const ResourceSchema = ({ onChange, schema, data }) => {
  const handleFormChange = ({ formData }) => {
    onChange(formData);
  };

  return (
    <JsonSchemaForm
      id="schemaDataForm"
      schema={schema}
      onChange={handleFormChange}
      formData={data}
    />
  );
};

export default ResourceSchema;
