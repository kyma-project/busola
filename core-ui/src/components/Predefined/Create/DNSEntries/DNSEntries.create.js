import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import { DNSNameRef } from './DNSNameRef';
import { TargetRef } from './TargetRef';
import { createDNSEntryTemplate } from './helpers';

export function DNSEntriesCreate({
  onChange,
  formElementRef,
  namespace,
  setCustomValid,
}) {
  const { t } = useTranslation();
  const [dnsEntry, setDnsEntry] = useState(createDNSEntryTemplate(namespace));
  const [withCNAME, setWithCNAME] = useState(false);

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
        kind={t('dnsentries.name_singular')}
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

      <DNSNameRef
        required
        id="dns-name-ref"
        domain={dnsEntry.spec.dnsName}
        onChange={domain => {
          jp.value(dnsEntry, '$.spec.dnsName', domain);
          const spec = { ...dnsEntry.spec, dnsName: domain };
          setDnsEntry({ ...dnsEntry, ...spec });
        }}
      />
      <TargetRef
        simple
        required
        id="targets-ref"
        dnsEntry={dnsEntry}
        setResource={setDnsEntry}
        withCNAME={withCNAME}
        setWithCNAME={setWithCNAME}
        onChange={target => {
          jp.value(dnsEntry, '$.spec.targets', target ? [target] : []);
          const spec = { ...dnsEntry.spec, targets: target ? [target] : [] };
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
