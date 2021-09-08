import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LuigiClient from '@luigi-project/client';

import { usePost, useNotification } from 'react-shared';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import {
  dnsEntryToYaml,
  yamlToDNSEntry,
  createDNSEntryTemplate,
} from './helpers';
import { SimpleForm } from './SimpleForm';
import { AdvancedForm } from './AdvancedForm';

export function CreateDNSEntryForm({ namespaceId, formElementRef, onChange }) {
  const { t } = useTranslation();
  const notification = useNotification();
  const postRequest = usePost();
  const [dnsEntry, setDNSEntry] = useState(createDNSEntryTemplate(namespaceId));

  const createDNSEntry = async () => {
    try {
      await postRequest(
        `/apis/dns.gardener.cloud/v1alpha1/namespaces/${namespaceId}/dnsentries/`,
        dnsEntryToYaml(dnsEntry),
      );
      notification.notifySuccess({
        content: t('dnsentries.messages.created'),
      });
      LuigiClient.linkManager()
        .fromContext('namespace')
        .navigate(`/dnsentries/details/${dnsEntry.name}`);
    } catch (e) {
      console.error(e);
      notification.notifyError({
        content: t('dnsentries.messages.cannot-create') + e.message,
      });
      return false;
    }
  };

  return (
    <CreateForm
      simpleForm={<SimpleForm dnsEntry={dnsEntry} setDNSEntry={setDNSEntry} />}
      advancedForm={
        <AdvancedForm dnsEntry={dnsEntry} setDNSEntry={setDNSEntry} />
      }
      resource={dnsEntry}
      setResource={setDNSEntry}
      toYaml={dnsEntry => dnsEntryToYaml(dnsEntry)}
      fromYaml={yamlToDNSEntry}
      onCreate={createDNSEntry}
      onChange={onChange}
      formElementRef={formElementRef}
    />
  );
}
