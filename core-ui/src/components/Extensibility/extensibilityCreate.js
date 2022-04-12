import React, { useState, useRef } from 'react';
import * as jp from 'jsonpath';
import { isEmpty, isEqual } from 'lodash';
import { useTranslation } from 'react-i18next';

import { createTemplate } from './helpers';
import ResourceSchema from './components/ResourceSchema';
import { K8sNameField, KeyValueField } from 'shared/ResourceForm/fields';
import { ResourceForm } from 'shared/ResourceForm';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

export function ExtensibilityCreate({
  formElementRef,
  onChange,
  setCustomValid,
  resourceType,
  resourceUrl,
  resource: createResource,
}) {
  const { t } = useTranslation();
  const jsonSchemaFormRef = useRef(null);
  const { namespaceId: namespace } = useMicrofrontendContext();
  const api = createResource?.nav?.resource || {};

  const [resource, setResource] = useState(
    createTemplate(api, namespace, createResource?.nav?.scope),
  );

  const simpleSchema = createResource?.create?.simple?.schema;
  const advancedSchema = createResource?.create?.advanced?.schema;

  const handleNameChange = name => {
    jp.value(resource, '$.metadata.name', name);
    jp.value(resource, "$.metadata.labels['app.kubernetes.io/name']", name);

    setResource({ ...resource });
  };

  return (
    <ResourceForm
      pluralKind={resourceType}
      singularName={resourceType}
      resource={resource}
      setResource={setResource}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
    >
      <K8sNameField
        propertyPath="$.metadata.name"
        kind={api.kind}
        setValue={handleNameChange}
        validate={value => !!value}
      />
      <KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
        className="fd-margin-top--sm"
      />
      <KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />
      <ResourceSchema
        simple
        key={api.version}
        schemaFormRef={jsonSchemaFormRef}
        data={simpleSchema || {}}
        instanceCreateParameterSchema={simpleSchema}
        onSubmitSchemaForm={() => {}}
        onFormChange={formData => {
          onChange(formData);
          // if (
          //   !isEqual(formData?.spec, resource?.spec)
          // ) {
          // const newResource = formData?.spec || {};
          // delete newResource?.properties;
          // delete newResource?.type;
          // setResource(newResource);
          // }
        }}
      />
      <ResourceSchema
        advanced
        key={api.version}
        schemaFormRef={jsonSchemaFormRef}
        data={advancedSchema || {}}
        instanceCreateParameterSchema={advancedSchema}
        onSubmitSchemaForm={() => {}}
        onFormChange={formData => {
          onChange(formData);
          // if (
          //   !isEqual(formData?.spec, resource?.spec)
          // ) {
          // const newResource = formData?.spec || {};
          // delete newResource?.properties;
          // delete newResource?.type;
          // setResource(newResource);
          // }
        }}
      />
    </ResourceForm>
  );
}
