import React, { useState } from 'react';
import LuigiClient from '@luigi-project/client';

import { usePost, useNotification } from 'react-shared';
import { CreateForm } from 'shared/components/CreateForm/CreateForm';
import {
  dnsProviderToYaml,
  yamlToDNSProvider,
  createDNSProviderTemplate,
} from './helpers';
import { SimpleForm } from './SimpleForm';
import { AdvancedForm } from './AdvancedForm';

export function CreateDNSProviderForm({
  namespaceId,
  formElementRef,
  onChange,
}) {
  const notification = useNotification();
  const postRequest = usePost();
  const [dnsProvider, setDNSProvider] = useState(
    createDNSProviderTemplate(namespaceId),
  );

  const createDNSProvider = async () => {
    try {
      await postRequest(
        `/apis/dns.gardener.cloud/v1alpha1/namespaces/${namespaceId}/dnsproviders/`,
        dnsProviderToYaml(dnsProvider),
      );
      notification.notifySuccess({
        content: 'DNS Provider created',
      });
      LuigiClient.linkManager()
        .fromContext('namespace')
        .navigate(`/dnsproviders/details/${dnsProvider.name}`);
    } catch (e) {
      console.error(e);
      notification.notifyError({
        content: 'Cannot create DNS Provider:' + e.message,
      });
      return false;
    }
  };

  return (
    <CreateForm
      simpleForm={
        <SimpleForm dnsProvider={dnsProvider} setDNSProvider={setDNSProvider} />
      }
      advancedForm={
        <AdvancedForm
          dnsProvider={dnsProvider}
          setDNSProvider={setDNSProvider}
        />
      }
      resource={dnsProvider}
      setResource={setDNSProvider}
      toYaml={dnsProvider => dnsProviderToYaml(dnsProvider)}
      fromYaml={yamlToDNSProvider}
      onCreate={createDNSProvider}
      onChange={onChange}
      formElementRef={formElementRef}
    />
  );
}
