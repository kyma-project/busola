import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import { DNSProviderRef } from 'shared/components/ResourceRef/DNSProviderRef';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import { createDNSEntryTemplate } from './helpers';

export function DNSEntriesCreate({
  onChange,
  formElementRef,
  namespace,
  setCustomValid,
}) {
  const { t } = useTranslation();
  const [dnsEntry, setDnsEntry] = useState(createDNSEntryTemplate(namespace));

  React.useEffect(() => {
    // setCustomValid(validateDnsEntry(dnsEntry));
  }, [dnsEntry, setDnsEntry, setCustomValid]);

  return (
    <ResourceForm
      pluralKind="dnsEntries"
      singularName={t('dnsentries.name_singular')}
      resource={dnsEntry}
      setResource={setDnsEntry}
      onChange={onChange}
      formElementRef={formElementRef}
      createUrl={`/apis/dns.gardener.cloud/v1alpha1/namespaces/${namespace}/dnsentries/`}
    >
      <ResourceForm.K8sNameField
        propertyPath="$.metadata.name"
        kind={t('name_singular.name_singular')}
        customSetValue={name => {
          jp.value(dnsEntry, '$.metadata.name', name);
          jp.value(
            dnsEntry,
            "$.metadata.labels['app.kubernetes.io/name']",
            name,
          );
          setDnsEntry({ ...dnsEntry });
        }}
      />

      <DNSProviderRef
        required
        id="dns-provider-ref"
        domain={dnsEntry.spec.dnsName}
        onChange={domain => {
          jp.value(dnsEntry, '$.spec.dnsName', domain);
          const spec = { ...dnsEntry.spec, dnsName: domain };
          setDnsEntry({ ...dnsEntry, ...spec });
        }}
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
        className="fd-margin-top--sm"
      />
      <ResourceForm.KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
      />
      <ResourceForm.FormField
        advanced
        required
        propertyPath="$.spec.ttl"
        label={t('dnsentries.labels.ttl')}
        input={Inputs.Number}
        placeholder={t('dnsentries.placeholders.ttl')}
      ></ResourceForm.FormField>
    </ResourceForm>
  );
}
