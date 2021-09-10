import React from 'react';
import { useTranslation } from 'react-i18next';
import { usePost } from 'react-shared';
import { ResourceForm } from '../ResourceForm/ResourceForm';
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
  const postRequest = usePost();
  const { t } = useTranslation();

  React.useEffect(() => {
    const isTypeSet = jp.value(dnsProvider, '$.spec.type');
    const isSecretRefSet =
      jp.value(dnsProvider, '$.spec.secretRef.name') &&
      jp.value(dnsProvider, '$.spec.secretRef.namespace');

    setCustomValid(isTypeSet && isSecretRefSet);
  }, [dnsProvider, setCustomValid]);

  return (
    <ResourceForm
      pluralKind="dnsProviders"
      singularName={t('dnsproviders.name_singular')}
      resource={dnsProvider}
      setResource={setDNSProvider}
      onChange={onChange}
      formElementRef={formElementRef}
      createFn={async () =>
        postRequest(
          `/apis/dns.gardener.cloud/v1alpha1/namespaces/${namespace}/dnsproviders/`,
          dnsProvider,
        )
      }
    >
      <ResourceForm.K8sNameField
        propertyPath="$.metadata.name"
        kind={t('dnsproviders.name_singular')}
        customOnChange={name => {
          jp.value(dnsProvider, '$.metadata.name', name);
          jp.value(
            dnsProvider,
            "$.metadata.labels['app.kubernetes.io/name']",
            name,
          );
          setDNSProvider({ ...dnsProvider });
        }}
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        label={t('common.headers.labels')}
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        label={t('common.headers.annotations')}
      />
      <ResourceForm.FormField
        required
        propertyPath="$.spec.secretRef"
        label={t('dnsproviders.labels.secret-reference')}
        input={(value, setValue) => (
          <SecretRef
            id="secret-ref-input"
            resourceRef={value || {}}
            onChange={(_, secretRef) => setValue(secretRef)}
          />
        )}
      />
      <ResourceForm.FormField
        propertyPath="$.spec.type"
        label={t('dnsproviders.labels.type')}
        required
        input={(value, setValue) => (
          <ProviderTypeDropdown type={value} setType={setValue} />
        )}
      />
      <ResourceForm.TextArea
        propertyPath="$.spec.domains.include"
        label={t('dnsproviders.labels.include-domains')}
        placeholder={t('dnsproviders.placeholders.include-domains')}
      />
      <ResourceForm.TextArea
        advanced
        propertyPath="$.spec.domains.exclude"
        label={t('dnsproviders.labels.exclude-domains')}
        placeholder={t('dnsproviders.placeholders.exclude-domains')}
      />
    </ResourceForm>
  );
}
