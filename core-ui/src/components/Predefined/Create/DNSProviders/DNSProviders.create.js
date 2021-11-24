import React, { useEffect, useState } from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';
import { useGet } from 'react-shared';
import { cloneDeep } from 'lodash';
import { ResourceForm } from 'shared/ResourceForm';
import { SecretRef } from 'shared/components/ResourceRef/SecretRef';
import {
  K8sNameField,
  KeyValueField,
  TextArrayInput,
} from 'shared/ResourceForm/fields';
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
  resource: initialDnsProvider,
  resourceUrl,
}) {
  const { t } = useTranslation();

  const [dnsProvider, setDNSProvider] = useState(
    initialDnsProvider
      ? cloneDeep(initialDnsProvider)
      : createDNSProviderTemplate(namespace),
  );
  const { data: configmap } = useGet(
    `/api/v1/namespaces/kube-system/configmaps/shoot-info`,
    {
      pollingInterval: 0,
    },
  );

  useEffect(() => {
    if (configmap) {
      setDNSProvider(
        createDNSProviderTemplateForGardener(namespace, initialDnsProvider),
      );
    }
  }, [configmap, namespace, setDNSProvider]); // eslint-disable-line react-hooks/exhaustive-deps

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
      initialResource={initialDnsProvider}
      setResource={setDNSProvider}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={resourceUrl}
    >
      <K8sNameField
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
        readOnly={!!initialDnsProvider}
      />
      <ResourceForm.FormField
        propertyPath="$.spec.type"
        label={t('dnsproviders.labels.type')}
        required
        input={({ value, setValue }) => (
          <ProviderTypeDropdown
            type={value}
            setType={setValue}
            dnsProvider={dnsProvider}
          />
        )}
      />

      <SecretRef
        required
        className={'fd-margin-top--sm'}
        id="secretRef"
        propertyPath="$.spec.secretRef"
        title={t('dnsproviders.labels.secret-reference')}
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
      <TextArrayInput
        required
        propertyPath="$.spec.domains.include"
        title={t('domains.include.label')}
        tooltipContent={t('dnsproviders.tooltips.included-domains')}
        inputProps={{
          placeholder: t('domains.include.placeholder'),
        }}
      />
      <TextArrayInput
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
DNSProvidersCreate.allowEdit = true;
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
