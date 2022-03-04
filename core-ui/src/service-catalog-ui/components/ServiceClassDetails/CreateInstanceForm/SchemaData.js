import React, { useState, useLayoutEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { Icon } from 'fundamental-react';
import ErrorBoundary from './ErrorBoundary';
import { Bold, Flex, JsonSchemaForm } from './styled';
const [draft04, draft06] = [
  require('ajv/lib/refs/json-schema-draft-04.json'),
  require('ajv/lib/refs/json-schema-draft-06.json'),
];

const SchemaData = ({
  onFormChange,
  onSubmitSchemaForm,
  data,
  children,
  instanceCreateParameterSchema,
  planName,
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

    onFormChange({
      instanceCreateParameters: formData,
    });
  };

  const getAdditionalMetaSchemas = currentSchema => {
    let additionalSchemaArray = [];
    if (currentSchema) {
      currentSchema.includes('draft-04') && additionalSchemaArray.push(draft04);
      currentSchema.includes('draft-06') && additionalSchemaArray.push(draft06);
    }
    return additionalSchemaArray;
  };

  const removeErrorMessages = errors =>
    errors.map(e => {
      e.message = '';
      return e;
    });

  return (
    <ErrorBoundary
      content={
        <Flex>
          <Icon
            glyph="error"
            style={{ padding: '0 5px 0 0' }}
            ariaLabel="Incorrect schema"
          />{' '}
          Incorrect Instance Create Parameter schema in <Bold>{planName}</Bold>{' '}
          plan
        </Flex>
      }
    >
      <JsonSchemaForm
        id="schemaDataForm"
        schemaFormRef={schemaFormRef}
        schema={instanceCreateParameterSchema}
        additionalMetaSchemas={getAdditionalMetaSchemas(
          instanceCreateParameterSchema.$schema,
        )}
        onChange={handleFormChange}
        liveValidate
        onSubmit={onSubmitSchemaForm}
        formData={data}
        transformErrors={validationVisible ? undefined : removeErrorMessages}
      >
        {children}
      </JsonSchemaForm>
    </ErrorBoundary>
  );
};

SchemaData.propTypes = {
  onFormChange: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  children: PropTypes.element,
  instanceCreateParameterSchema: PropTypes.object,
  onSubmitSchemaForm: PropTypes.func.isRequired,
  planName: PropTypes.string,
  schemaFormRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
};

export default SchemaData;
