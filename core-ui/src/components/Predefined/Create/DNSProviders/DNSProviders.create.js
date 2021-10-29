import React, { useEffect } from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';
import { useGet } from 'react-shared';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { SecretRef } from 'shared/components/ResourceRef/SecretRef';
import {
  createDNSProviderTemplate,
  createDNSProviderTemplateForGardener,
} from './templates';
import { ProviderTypeDropdown } from './ProviderTypeDropdown';

function DNSProvidersCreate({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
}) {
  const { t } = useTranslation();
  const [dnsProvider, setDNSProvider] = React.useState(
    createDNSProviderTemplate(namespace),
  );
  const { data: configmap } = useGet(
    `/api/v1/namespaces/kube-system/configmaps/shoot-info`,
    {
      pollingInterval: 0,
    },
  );

  useEffect(() => {
    if (configmap) {
      setDNSProvider(createDNSProviderTemplateForGardener(namespace));
    }
  }, [configmap, namespace, setDNSProvider]);

  useEffect(() => {
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
DNSProvidersCreate.secrets = (t, { features } = {}) => {
  if (!features?.CUSTOM_DOMAINS?.isEnabled) {
    return [];
  }
  return [
    {
      title: 'Amazon Route53',
      name: 'amazon-route53',
      data: ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY'],
    },
    {
      title: 'GoogleCloud DNS',
      name: 'google-cloud-dns',
      data: ['serviceaccount.json'],
    },
    {
      title: 'AliCloud DNS',
      name: 'ali-cloud-dns',
      data: ['ACCESS_KEY_ID', 'SECRET_ACCESS_KEY'],
    },
    {
      title: 'Azure DNS',
      name: 'azure-dns',
      data: [
        'AZURE_SUBSCRIPTION_ID',
        'AZURE_TENANT_ID',
        'AZURE_CLIENT_ID',
        'AZURE_CLIENT_SECRET',
      ],
    },
    {
      title: 'OpenStack Designate',
      name: 'openstack-designate',
      data: [
        'OS_AUTH_URL',
        'OS_DOMAIN_NAME',
        'OS_PROJECT_NAME',
        'OS_USERNAME',
        'OS_PASSWORD',
        'OS_PROJECT_ID',
        'OS_REGION_NAME',
        'OS_TENANT_NAME',
        'OS_APPLICATION_CREDENTIAL_ID',
        'OS_APPLICATION_CREDENTIAL_NAME',
        'OS_APPLICATION_CREDENTIAL_SECRET',
        'OS_DOMAIN_ID',
        'OS_USER_DOMAIN_NAME',
        'OS_USER_DOMAIN_ID',
      ],
    },
    {
      title: 'Cloudflare DNS',
      name: 'cloudflare-dns',
      data: ['CLOUDFLARE_API_TOKEN'],
    },
    {
      title: 'Infoblox',
      name: 'infoblox',
      data: ['USERNAME', 'PASSWORD'],
    },
    {
      title: 'Netlify DNS',
      name: 'netlify-dns',
      data: ['NETLIFY_AUTH_TOKEN'],
    },
  ];
};
export { DNSProvidersCreate };
