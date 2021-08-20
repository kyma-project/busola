import React from 'react';
import LuigiClient from '@luigi-project/client';
import { Link } from 'fundamental-react';
import { DefinitionList } from '../../../../shared/components/DefinitionList/DefinitionList';

export function ServiceBindingData({ spec, status }) {
  const navigateToInstance = instanceName =>
    LuigiClient.linkManager()
      .fromContext('namespace')
      .navigate(`/btp-instances/details/${instanceName}`);

  const navigateToSecret = secretName =>
    LuigiClient.linkManager()
      .fromContext('namespace')
      .navigate(`/secrets/details/${secretName}`);

  const list = [
    {
      name: 'Service Instance name:',

      value: (
        <Link
          className="fd-link"
          onClick={() => navigateToInstance(spec.serviceInstanceName)}
        >
          {spec.serviceInstanceName}
        </Link>
      ),
    },
    {
      name: 'Secret:',
      value: (
        <Link
          className="fd-link"
          onClick={() => navigateToSecret(spec.secretName)}
        >
          {spec.secretName}
        </Link>
      ),
    },
    { name: 'External name:', value: spec.externalName },
    { name: 'Binding ID:', value: status.bindingID || 'Not set' },
    { name: 'Instance ID:', value: status.instanceID || 'Not set' },
  ];

  return <DefinitionList title="Binding Data" list={list} key="binding-data" />;
}
