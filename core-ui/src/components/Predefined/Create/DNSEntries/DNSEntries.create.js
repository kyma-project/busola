import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGet } from 'react-shared';
import * as jp from 'jsonpath';

import { ResourceForm } from 'shared/ResourceForm/ResourceForm';
import * as Inputs from 'shared/ResourceForm/components/Inputs';
import { DNSNameRef } from './DNSNameRef';
import { TargetsRef } from './TargetsRef';
import { TextRef } from './TextRef';
import {
  createDNSEntryTemplate,
  createDNSEntryTemplateForGardener,
} from './helpers';

export function DNSEntriesCreate({
  onChange,
  formElementRef,
  namespace,
  setCustomValid,
}) {
  const { t } = useTranslation();
  const [dnsEntry, setDnsEntry] = useState(createDNSEntryTemplate(namespace));
  const { data: configmap } = useGet(
    `/api/v1/namespaces/kube-system/configmaps/shoot-info`,
    {
      pollingInterval: 0,
    },
  );

  useEffect(() => {
    if (configmap) {
      setDnsEntry(createDNSEntryTemplateForGardener(namespace));
    }
  }, [configmap, namespace, setDnsEntry]);

  useEffect(() => {
    setCustomValid(validateDnsEntry(dnsEntry));
  }, [dnsEntry, setDnsEntry, setCustomValid]);

  const validateDnsEntry = entry => {
    const isTtlValid = !!entry?.spec.ttl && typeof entry?.spec.ttl === 'number';
    const isDnsNameValid = !!entry?.spec.dnsName;
    const hasTargetsorText =
      !!entry?.spec.targets?.length || !!entry?.spec.text?.length;
    return isTtlValid && isDnsNameValid && hasTargetsorText;
  };

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
        domain={dnsEntry?.spec.dnsName}
        onChange={domain => {
          jp.value(dnsEntry, '$.spec.dnsName', domain);
          setDnsEntry({ ...dnsEntry });
        }}
      />

      <ResourceForm.FormField
        required
        propertyPath="$.spec.ttl"
        label={t('dnsentries.labels.ttl')}
        input={Inputs.Number}
        placeholder={t('dnsentries.placeholders.ttl')}
      ></ResourceForm.FormField>

      <TargetsRef
        dnsEntry={dnsEntry}
        setDnsEntry={setDnsEntry}
        setTargets={targets => {
          jp.value(dnsEntry, '$.spec.targets', targets);
          setDnsEntry({ ...dnsEntry });
        }}
      />

      <TextRef
        advanced={true}
        text={dnsEntry?.spec.text}
        setText={text => {
          jp.value(dnsEntry, '$.spec.text', text);
          setDnsEntry({ ...dnsEntry });
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
    </ResourceForm>
  );
}
