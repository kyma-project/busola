import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import { TextArrayInput } from 'shared/ResourceForm/fields';

import { DNSNameRef } from './DNSNameRef';
import { TargetsRef } from './TargetsRef';
import {
  createDNSEntryTemplate,
  createDNSEntryTemplateForGardener,
} from './helpers';

export function DnsEntryCreate({
  onChange,
  formElementRef,
  namespace,
  setCustomValid,
  resource: initialDNSEntry,
  resourceUrl,
  ...props
}) {
  const { t } = useTranslation();
  const [dnsEntry, setDnsEntry] = useState(
    initialDNSEntry
      ? cloneDeep(initialDNSEntry)
      : createDNSEntryTemplate(namespace),
  );

  const { data: configmap } = useGet(
    `/api/v1/namespaces/kube-system/configmaps/shoot-info`,
    {
      pollingInterval: 0,
    },
  );

  useEffect(() => {
    if (configmap && !initialDNSEntry) {
      setDnsEntry(createDNSEntryTemplateForGardener(namespace));
    }
  }, [configmap, namespace, setDnsEntry, initialDNSEntry]);

  return (
    <ResourceForm
      {...props}
      pluralKind="dnsEntries"
      singularName={t('dnsentries.name_singular')}
      resource={dnsEntry}
      setResource={setDnsEntry}
      onChange={onChange}
      formElementRef={formElementRef}
      initialResource={initialDNSEntry}
      createUrl={resourceUrl}
      setCustomValid={setCustomValid}
    >
      <DNSNameRef required validate={entry => !!entry?.spec?.dnsName} />

      <ResourceForm.FormField
        required
        propertyPath="$.spec.ttl"
        label={t('dnsentries.labels.ttl')}
        input={Inputs.Number}
        placeholder={t('dnsentries.placeholders.ttl')}
        validate={ttl => typeof ttl === 'number' && ttl >= 0}
        min={0}
      />

      <TargetsRef
        validate={entry =>
          !!entry?.spec.targets?.length || !!entry?.spec.text?.length
        }
      />

      <TextArrayInput
        advanced
        propertyPath="$.spec.text"
        title={t('dnsentries.labels.text')}
        tooltipContent={t('dnsentries.tooltips.text')}
        inputProps={{
          placeholder: t('dnsentries.tooltips.text'),
        }}
      />
    </ResourceForm>
  );
}
DnsEntryCreate.allowEdit = true;
