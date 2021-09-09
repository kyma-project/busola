import React from 'react';
import { useTranslation } from 'react-i18next';
import { postRequest } from 'react-shared';
import { ResourceForm } from '../ResourceForm/ResourceForm';
import { createDNSProviderTemplate } from './templates';
import { K8sNameInput } from 'react-shared';
import { LabelsInput } from 'components/Lambdas/components';
import { ProviderTypeDropdown } from './ProviderTypeDropdown';
import { SecretRef } from 'shared/components/ResourceRef/SecretRef';

export function DNSProvidersCreate({ formElementRef, namespace, onChange }) {
  const [dnsProvider, setDNSProvider] = React.useState(
    createDNSProviderTemplate(namespace),
  );
  const { t, i18n } = useTranslation();

  return (
    <ResourceForm
      pluralKind="dnsProviders"
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
      <ResourceForm.FormField
        required
        propertyPath="$.metadata.name"
        label={t('common.labels.name')}
        input={(value, setValue) => (
          <K8sNameInput
            kind={t('dnsProviders.name_plural')}
            compact
            required
            showLabel={false}
            onChange={e => setValue(e.target.value)}
            value={value}
            i18n={i18n}
          />
        )}
      />
      <ResourceForm.FormField
        advanced
        propertyPath="$.metadata.labels"
        label={t('common.headers.labels')}
        input={(value, setValue) => (
          <LabelsInput
            compact
            showFormLabel={false}
            labels={value}
            onChange={labels => setValue(labels)}
            i18n={i18n}
          />
        )}
      />
      <ResourceForm.FormField
        advanced
        propertyPath="$.metadata.annotations"
        label={t('common.headers.annotations')}
        input={(value, setValue) => (
          <LabelsInput
            compact
            showFormLabel={false}
            labels={value}
            onChange={labels => setValue(labels)}
            i18n={i18n}
            type={t('common.headers.annotations')}
          />
        )}
      />
      <ResourceForm.FormField
        propertyPath="$.spec.secretRef"
        label={'secret ref'}
        input={(value, setValue) => (
          <SecretRef
            id="secret-ref-input"
            resourceRef={value || {}}
            onChange={(_, secretRef) => setValue(secretRef)}
          />
        )}
      />
      <ResourceForm.FormField
        propertyPath="$.type"
        label={'todo'}
        input={(value, setValue) => (
          <ProviderTypeDropdown type={value} setType={setValue} />
        )}
      />
      <ResourceForm.TextArea
        propertyPath="$.domains.include"
        label={'todo'}
        placeholder="Domains that should be observed, one per line"
      />
      <ResourceForm.TextArea
        advanced
        propertyPath="$.domains.exclude"
        label={'todo'}
        placeholder="Domains that should be ignored, one per line"
      />
    </ResourceForm>
  );
}
