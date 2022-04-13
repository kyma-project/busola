import React, { useState, useRef } from 'react';
import * as jp from 'jsonpath';
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

  const handleFieldChange = value => {
    //not only spec :)
    jp.value(resource, '$.spec', value);
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
      onlyYaml={!(simpleSchema || advancedSchema)}
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
      />
      <KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />
      <ResourceSchema
        simple
        key={api.version}
        schema={simpleSchema || advancedSchema || {}}
        data={resource.spec || {}}
        onSubmit={() => {}}
        onChange={handleFieldChange}
      />
      <ResourceSchema
        advanced
        key={api.version}
        schema={advancedSchema || simpleSchema || {}}
        data={resource.spec || {}}
        onChange={handleFieldChange}
      />
    </ResourceForm>
  );
}
