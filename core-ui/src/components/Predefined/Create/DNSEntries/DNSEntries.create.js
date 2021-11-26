import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGet } from 'react-shared';
import * as jp from 'jsonpath';
import { cloneDeep } from 'lodash';

import { ResourceForm } from 'shared/ResourceForm';
import * as Inputs from 'shared/ResourceForm/inputs';
import {
  K8sNameField,
  KeyValueField,
  TextArrayInput,
} from 'shared/ResourceForm/fields';
import { DNSNameRef } from './DNSNameRef';
import { TargetsRef } from './TargetsRef';
import {
  createDNSEntryTemplate,
  createDNSEntryTemplateForGardener,
} from './helpers';

function DNSEntriesCreate({
  onChange,
  formElementRef,
  namespace,
  setCustomValid,
  resource: initialDNSEntry,
  resourceUrl,
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
      <K8sNameField
        propertyPath="$.metadata.name"
        kind={t('dnsentries.name_singular')}
        setValue={name => {
          jp.value(dnsEntry, '$.metadata.name', name);
          jp.value(
            dnsEntry,
            "$.metadata.labels['app.kubernetes.io/name']",
            name,
          );
          setDnsEntry({ ...dnsEntry });
        }}
        readOnly={initialDNSEntry}
        validate={name => !!name}
      />

      <DNSNameRef required validate={entry => !!entry?.spec?.dnsName} />

      <ResourceForm.FormField
        required
        propertyPath="$.spec.ttl"
        label={t('dnsentries.labels.ttl')}
        input={Inputs.Number}
        placeholder={t('dnsentries.placeholders.ttl')}
        validate={ttl => !!ttl && typeof ttl === 'number'}
      />

      <KeyValueField
        advanced
        propertyPath="$.metadata.labels"
        title={t('common.headers.labels')}
        className="fd-margin-top--sm"
      />

      <KeyValueField
        advanced
        propertyPath="$.metadata.annotations"
        title={t('common.headers.annotations')}
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

DNSEntriesCreate.allowEdit = true;
export { DNSEntriesCreate };
