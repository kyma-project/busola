import React from 'react';
import { useTranslation } from 'react-i18next';
import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { createDNSProviderTemplate } from './templates';
import { ProviderTypeDropdown } from './ProviderTypeDropdown';
import { SecretRef } from 'shared/components/ResourceRef/SecretRef';
import * as jp from 'jsonpath';

export function DNSProvidersCreate({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
}) {
  const [dnsProvider, setDNSProvider] = React.useState(
    createDNSProviderTemplate(namespace),
  );
  const { t } = useTranslation();

  React.useEffect(() => {
    const isTypeSet = jp.value(dnsProvider, '$.spec.type');
    const isSecretRefSet =
      jp.value(dnsProvider, '$.spec.secretRef.name') &&
      jp.value(dnsProvider, '$.spec.secretRef.namespace');

    const domains = jp.value(dnsProvider, '$.spec.domains.include');
    const hasAtLeastOneIncludeDomain =
      Array.isArray(domains) && domains.some(e => e?.length);

    setCustomValid(isTypeSet && isSecretRefSet && hasAtLeastOneIncludeDomain);
  }, [dnsProvider, setCustomValid]);

  return (
    <ResourceForm
      pluralKind="dnsProviders"
      singularName={t('dnsproviders.name_singular')}
      resource={dnsProvider}
      setResource={setDNSProvider}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={`/apis/dns.gardener.cloud/v1alpha1/namespaces/${namespace}/dnsproviders/`}
    >
      <ResourceForm.K8sNameField
        propertyPath="$.metadata.name"
        kind={t('dnsproviders.name_singular')}
        setValue={name => {
          jp.value(dnsProvider, '$.metadata.name', name);
          jp.value(
            dnsProvider,
            "$.metadata.labels['app.kubernetes.io/name']",
            name,
          );
          setDNSProvider({ ...dnsProvider });
        }}
      />
      <ResourceForm.FormField
        propertyPath="$.spec.type"
        label={t('dnsproviders.labels.type')}
        required
        input={({ value, setValue }) => (
          <ProviderTypeDropdown type={value} setType={setValue} />
        )}
        className="fd-margin-bottom--sm"
      />
      <SecretRef
        required
        className={'fd-margin-top--sm'}
        id="secretRef"
        propertyPath="$.spec.secretRef"
        title={t('dnsproviders.labels.secret-reference')}
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />
      <ResourceForm.TextArrayInput
        required
        propertyPath="$.spec.domains.include"
        title={t('domains.include.label')}
        tooltipContent={t('dnsproviders.tooltips.included-domains')}
        inputProps={{
          placeholder: t('domains.include.placeholder'),
        }}
      />
      <ResourceForm.TextArrayInput
        advanced
        propertyPath="$.spec.domains.exclude"
        title={t('domains.exclude.label')}
        tooltipContent={t('dnsproviders.tooltips.excluded-domains')}
        inputProps={{
          placeholder: t('domains.exclude.placeholder'),
        }}
      />
    </ResourceForm>
  );
}
