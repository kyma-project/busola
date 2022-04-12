import React, { useState, useLayoutEffect, useRef } from 'react';

import { JsonSchemaForm } from './JSONSchemaForm';
const [draft04, draft06] = [
  require('ajv/lib/refs/json-schema-draft-04.json'),
  require('ajv/lib/refs/json-schema-draft-06.json'),
];

const ResourceSchema = ({
  onFormChange,
  onSubmitSchemaForm,
  data,
  children,
  instanceCreateParameterSchema,
  schemaFormRef,
}) => {
  const initialFormData = useRef();
  const [validationVisible, setValidationVisible] = useState(false);

  useLayoutEffect(() => {
    initialFormData.current = null;
  }, [instanceCreateParameterSchema]);

  const handleFormChange = ({ formData }) => {
    if (!initialFormData.current) {
      setTimeout(() => {
        initialFormData.current = formData;
      });
    } else if (!validationVisible && initialFormData.current !== formData)
      setValidationVisible(true);

    onFormChange(formData);
  };

  const removeErrorMessages = errors =>
    errors.map(e => {
      e.message = '';
      return e;
    });

  return (
    <JsonSchemaForm
      id="schemaDataForm"
      schemaFormRef={schemaFormRef}
      schema={instanceCreateParameterSchema}
      additionalMetaSchemas={[draft04, draft06]}
      onChange={handleFormChange}
      liveValidate
      onSubmit={onSubmitSchemaForm}
      formData={data}
      transformErrors={validationVisible ? undefined : removeErrorMessages}
    >
      {children}
    </JsonSchemaForm>
  );
};

export default ResourceSchema;
