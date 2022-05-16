import React from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm';
import { K8sNameField, KeyValueField } from 'shared/ResourceForm/fields';

import * as Inputs from 'shared/ResourceForm/inputs';

import { createServiceInstanceTemplate } from './helpers.js';
import { FormTextarea } from 'fundamental-react';

export function ServiceInstanceCreate({
  namespace,
  formElementRef,
  onChange,
  resourceUrl,
  ...props
}) {
  const { t } = useTranslation();
  const [serviceInstance, setServiceInstance] = React.useState(
    createServiceInstanceTemplate(namespace),
  );
  return (
    <ResourceForm
      {...props}
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
      <ResourceForm.FormField
        required
        label={t('btp-instances.offering-name')}
        propertyPath="$.spec.serviceOfferingName"
        input={Inputs.Text}
        tooltipContent={t('btp-instances.tooltips.offering-name')}
      />
      <ResourceForm.FormField
        required
        label={t('btp-instances.plan-name')}
        propertyPath="$.spec.servicePlanName"
        input={Inputs.Text}
        placeholder={t('btp-instances.placeholders.plan-name')}
        tooltipContent={t('btp-instances.tooltips.plan-name')}
      />
      <ResourceForm.FormField
        advanced
        label={t('btp-instances.external-name')}
        propertyPath="$.spec.externalName"
        input={Inputs.Text}
        placeholder={t('btp-instances.placeholders.external-name')}
      />
      <KeyValueField
        title={t('btp-instances.parameters')}
        propertyPath="$.spec.parameters"
        validate={parsed => !!parsed && typeof parsed === 'object'}
        fullWidth
        advanced
        invalidValueMessage={t('btp-instances.messages.params-invalid')}
        input={({ setValue, ...props }) => (
          <FormTextarea
            compact
            onChange={e => setValue(e.target.value)}
            className="value-textarea"
            {...props}
            onKeyDown={() => {}} // overwrites default onKeyDown that switches focus when Enter is pressed
          />
        )}
      />
    </ResourceForm>
  );
}
