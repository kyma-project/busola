import React from 'react';
import Form from 'react-jsonschema-form';

import './JSONSchemaForm.scss';

export const JsonSchemaForm = ({ schemaFormRef, ...props }) => {
  return (
    <Form
      additionalMetaSchemas={[
        require('ajv/lib/refs/json-schema-draft-04.json'),
      ]}
      innerRef={schemaFormRef}
      {...props}
    />
  );
};
