import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'fundamental-react';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import { DNSNameRef } from './DNSNameRef';
import { TargetsRef } from './TargetsRef';
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
      <ResourceForm.CollapsibleSection
        simple
        title="Targets"
        defaultOpen
        resource={dnsEntry}
        setResource={setDnsEntry}
        propertyPath="$.spec.targets"
      >
        <TargetsRef
          advanced={false}
          value={dnsEntry}
          setValue={targets => {
            jp.value(dnsEntry, '$.spec.targets', targets);
            setDnsEntry(dnsEntry);
          }}
        />
      </ResourceForm.CollapsibleSection>

      <ResourceForm.CollapsibleSection
        advanced
        title="Targets"
        defaultOpen
        resource={dnsEntry}
        setResource={setDnsEntry}
        propertyPath="$.spec.targets"
        actions={setOpen => (
          <Button
            glyph="add"
            compact
            onClick={() => {
              const path = '$.spec.targets';
              const nextContainers = [...(jp.value(dnsEntry, path) || []), ''];
              jp.value(dnsEntry, path, nextContainers);
              setDnsEntry({ ...dnsEntry });
              onChange(new Event('input', { bubbles: true }));
              setOpen(true);
            }}
          >
            Add Target
          </Button>
        )}
      >
        <TargetsRef
          advanced={true}
          value={dnsEntry}
          setValue={targets => {
            jp.value(dnsEntry, '$.spec.targets', targets);
            setDnsEntry(dnsEntry);
          }}
        />
      </ResourceForm.CollapsibleSection>
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
