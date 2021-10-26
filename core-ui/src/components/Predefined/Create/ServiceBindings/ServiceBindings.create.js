import React from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';

import { useGetList } from 'react-shared';
import { K8sResourceSelectWithUseGetList } from 'shared/components/K8sResourceSelect';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { Editor } from 'shared/ResourceForm/components/Editor';
import {
  K8sNameField,
  KeyValueField,
  FormField,
  CollapsibleSection,
} from 'shared/ResourceForm/components/FormComponents';
import * as Inputs from 'shared/ResourceForm/components/Inputs';

import { createServiceBindingTemplate } from './helpers';
import { SecretRefForm } from './SecretRefForm/SecretRefForm';

export function ServiceBindingsCreate({
  namespace,
  formElementRef,
  onChange,
  setCustomValid,
  resourceUrl,
}) {
  const { t } = useTranslation();
  const [serviceBinding, setServiceBinding] = React.useState(
    createServiceBindingTemplate(namespace),
  );

  const { data: secrets, loading, error } = useGetList()(
    `/api/v1/namespaces/${namespace}/secrets`,
    {
      pollingInterval: 7000,
    },
  );

  React.useEffect(() => {
    const hasInstanceName = jp.value(
      serviceBinding,
      '$.spec.serviceInstanceName',
    );

    setCustomValid(hasInstanceName);
  }, [serviceBinding, setCustomValid]);

  return (
    <ResourceForm
      className="create-service-binding-form"
      pluralKind="servicebindings"
      singularName={t('btp-service-bindings.name_singular')}
      resource={serviceBinding}
      setResource={setServiceBinding}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
    >
      <K8sNameField
        propertyPath="$.metadata.name"
        kind={t('btp-service-bindings.name_singular')}
        setValue={name => {
          jp.value(serviceBinding, '$.metadata.name', name);
          jp.value(
            serviceBinding,
            "$.metadata.labels['app.kubernetes.io/name']",
            name,
          );
          setServiceBinding({ ...serviceBinding });
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
        propertyPath="$.spec.serviceInstanceName"
        label={t('btp-service-bindings.instance-name')}
        input={({ value, setValue }) => (
          <K8sResourceSelectWithUseGetList
            compact
            required
            value={value}
            resourceType={t('btp-service-bindings.resource-type')}
            onSelect={setValue}
            url={`/apis/services.cloud.sap.com/v1alpha1/namespaces/${namespace}/serviceinstances/`}
          />
        )}
      />
      <FormField
        advanced
        label={t('btp-service-bindings.external-name')}
        propertyPath="$.spec.externalName"
        input={Inputs.Text}
        placeholder={t('btp-service-bindings.placeholders.external-name')}
      />
      <FormField
        advanced
        label={t('btp-service-bindings.secret')}
        propertyPath="$.spec.secretName"
        tooltipContent={t('btp-service-bindings.tooltips.secret')}
        input={Inputs.Text}
        placeholder={t('btp-service-bindings.placeholders.secret')}
      />
      <CollapsibleSection
        advanced
        title={t('btp-service-bindings.parameters')}
        resource={serviceBinding}
        setResource={setServiceBinding}
      >
        <Editor
          propertyPath="$.spec.parameters"
          language="json"
          validate={parsed => !!parsed && typeof parsed === 'object'}
          invalidValueMessage={t(
            'btp-service-bindings.messages.params-invalid',
          )}
          height="10em"
        />
      </CollapsibleSection>
      <SecretRefForm
        advanced
        propertyPath="$.spec.parametersFrom"
        secrets={secrets}
        loading={loading}
        error={error}
      />
    </ResourceForm>
  );
}
