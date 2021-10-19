import React from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { Editor } from 'shared/ResourceForm/components/Editor';
import {
  K8sNameField,
  KeyValueField,
  FormField,
  CollapsibleSection,
} from 'shared/ResourceForm/components/FormComponents';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import { createServiceInstanceTemplate } from './helpers.js';

export function ServiceInstancesCreate({
  namespace,
  formElementRef,
  onChange,
  resourceUrl,
}) {
  const { t } = useTranslation();
  const [serviceInstance, setServiceInstance] = React.useState(
    createServiceInstanceTemplate(namespace),
  );

  return (
    <ResourceForm
      className="create-service-instance-form"
      pluralKind="serviceinstances"
      singularName={t('btp-instances.name_singular')}
      resource={serviceInstance}
      setResource={setServiceInstance}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
    >
      <K8sNameField
        propertyPath="$.metadata.name"
        kind={t('btp-instances.name_singular')}
        setValue={name => {
          jp.value(serviceInstance, '$.metadata.name', name);
          jp.value(
            serviceInstance,
            "$.metadata.labels['app.kubernetes.io/name']",
            name,
          );
          setServiceInstance({ ...serviceInstance });
        }}
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
      <FormField
        required
        label={t('btp-instances.offering-name')}
        propertyPath="$.spec.serviceOfferingName"
        input={Inputs.Text}
        placeholder={t('btp-instances.create.offering-name-description')}
      />
      <FormField
        required
        label={t('btp-instances.plan-name')}
        propertyPath="$.spec.servicePlanName"
        input={Inputs.Text}
        placeholder={t('btp-instances.create.plan-name-description')}
      />
      <FormField
        advanced
        label={t('btp-instances.external-name')}
        propertyPath="$.spec.externalName"
        input={Inputs.Text}
        placeholder={t('btp-instances.create.external-name-placeholder')}
      />
      <CollapsibleSection
        advanced
        title={t('btp-instances.parameters')}
        resource={serviceInstance}
        setResource={setServiceInstance}
      >
        <Editor
          propertyPath="$.spec.parameters"
          language="json"
          validate={parsed => !!parsed && typeof parsed === 'object'}
          invalidValueMessage={t('btp-instances.create.params-invalid')}
          height="10em"
        />
      </CollapsibleSection>
    </ResourceForm>
  );
}
