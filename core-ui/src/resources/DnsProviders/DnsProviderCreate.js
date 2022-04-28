import React, { useEffect, useState } from 'react';
import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';
import { cloneDeep } from 'lodash';

import { useGet } from 'shared/hooks/BackendAPI/useGet';
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

export function DnsProviderCreate({
  formElementRef,
  namespace,
  onChange,
  setCustomValid,
  resource: initialDnsProvider,
  resourceUrl,
  ...props
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
      {...props}
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
DnsProviderCreate.allowEdit = true;
