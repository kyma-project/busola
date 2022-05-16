import React, { useState } from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';

import { createTemplate } from './helpers';
import { ResourceSchema } from './components/ResourceSchema';
import { K8sNameField, KeyValueField } from 'shared/ResourceForm/fields';
import { ResourceForm } from 'shared/ResourceForm';
import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';

export function ExtensibilityCreate({
  formElementRef,
  setCustomValid,
  resourceType,
  resourceUrl,
  resource: createResource,
}) {
  const { t } = useTranslation();
  const { namespaceId: namespace } = useMicrofrontendContext();
  const api = createResource?.navigation?.resource || {};

  const [resource, setResource] = useState(
    createResource?.create?.template ||
      createTemplate(api, namespace, createResource?.navigation?.scope),
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
        resource={resource}
        setResource={setResource}
        onSubmit={() => {}}
        path={createResource?.navigation?.path || ''}
      />
      <ResourceSchema
        advanced
        key={api.version}
        schema={advancedSchema || simpleSchema || {}}
        resource={resource}
        setResource={setResource}
        path={createResource?.navigation?.path || ''}
      />
    </ResourceForm>
  );
}
