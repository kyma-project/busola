import React from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';

import { useGetList } from 'react-shared';
import {
  K8sResourceSelect,
  K8sResourceSelectWithUseGetList,
} from 'shared/components/K8sResourceSelect';
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

  /*
  const createServiceBinding = useCreateResource(
    'Service Binding',
    'servicebindings',
    serviceBindingToYaml(serviceBinding),
    `/apis/services.cloud.sap.com/v1alpha1/namespaces/${namespaceId}/servicebindings/`,
  );

  return (
    <CreateForm
      simpleForm={
        <SimpleForm
          serviceBinding={serviceBinding}
          setServiceBinding={setServiceBinding}
          namespaceId={namespaceId}
        />
      }
      advancedForm={
        <AdvancedForm
          serviceBinding={serviceBinding}
          setServiceBinding={setServiceBinding}
          namespaceId={namespaceId}
          setRefsValid={setCustomValid}
        />
      }
      modalOpeningComponent={
        <Button glyph="add">{t('btp-service-bindings.create.title')}</Button>
      }
      resource={serviceBinding}
      setResource={setServiceBinding}
      onClose={() =>
        setServiceBinding(createServiceBindingTemplate(namespaceId))
      }
      toYaml={serviceBindingToYaml}
      fromYaml={yamlToServiceBinding}
      onCreate={createServiceBinding}
      onChange={onChange}
      formElementRef={formElementRef}
    />
  );
  */

  return (
    <ResourceForm
      className="create-service-instance-form"
      pluralKind="serviceinstances"
      singularName={t('btp-instances.name_singular')}
      resource={serviceBinding}
      setResource={setServiceBinding}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
    >
      <K8sNameField
        propertyPath="$.metadata.name"
        kind={t('btp-instances.name_singular')}
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
        label={t('btp-instances.resource-type')}
        input={({ value, setValue }) => (
          <K8sResourceSelectWithUseGetList
            compact
            required
            value={value}
            resourceType={t('btp-instances.resource-type')}
            onSelect={setValue}
            url={`/apis/services.cloud.sap.com/v1alpha1/namespaces/${namespace}/serviceinstances/`}
          />
        )}
      />
      <FormField
        label={t('btp-service-bindings.external-name')}
        propertyPath="$.spec.externalName"
        input={Inputs.Text}
        placeholder={t('btp-service-bindings.create.external-name-placeholder')}
      />
      <FormField
        label={t('btp-service-bindings.secret')}
        tooltipContent={t('btp-service-bindings.create.secret-description')}
        propertyPath="$.spec.secretName"
        input={({ value, setValue }) => (
          <K8sResourceSelect
            compact
            data={secrets}
            loading={loading}
            error={error}
            value={value}
            resourceType={t('btp-service-bindings.secret')}
            onSelect={setValue}
            url={`/api/v1/namespaces/${namespace}/secrets`}
          />
        )}
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
          invalidValueMessage={t('btp-service-bindings.create.params-invalid')}
          height="10em"
        />
      </CollapsibleSection>
      <SecretRefForm />
      {/*
      <FormField
        required
        label={t('btp-instances.offering-name')}
        propertyPath='$.spec.serviceOfferingName'
        input={Inputs.Text}
        placeholder={t('btp-instances.create.offering-name-description')}
      />
      <FormField
        required
        label={t('btp-instances.plan-name')}
        propertyPath='$.spec.servicePlanName'
        input={Inputs.Text}
        placeholder={t('btp-instances.create.plan-name-description')}
      />
      <FormField
        advanced
        label={t('btp-instances.external-name')}
        propertyPath='$.spec.externalName'
        input={Inputs.Text}
        placeholder={t('btp-instances.create.external-name-placeholder')}
      />
      <CollapsibleSection
        title={t('btp-instances.parameters')}
        resource={serviceInstance}
        setResource={setServiceInstance}
      >
        <JSONField
          propertyPath='$.spec.parameters'
          validate={parsed => !!parsed && typeof parsed === 'object'} 
          invalidValueMessage={t('btp-instances.create.params-invalid')}
        />
      </CollapsibleSection>
      */}
    </ResourceForm>
  );
}
