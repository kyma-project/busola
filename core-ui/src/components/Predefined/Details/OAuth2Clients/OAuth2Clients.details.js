import React from 'react';

import SecretData from 'shared/components/Secret/SecretData';
import OAuthClientSpecPanel from './OAuthClientSpecPanel';
import { OAuth2ClientStatus } from 'shared/components/OAuth2ClientStatus/OAuth2ClientStatus';

import { useGet } from 'react-shared';

function SecretComponent({ namespaceName, secretName }) {
  const { data: secret, error, loading = true } = useGet(
    `/api/v1/namespaces/${namespaceName}/secrets/${secretName}`,
    {
      pollingInterval: 5000,
    },
  );

  if (loading) return 'Loading...';
  if (error) return `Error: ${error.message}`;

  return <SecretData secret={secret} />;
}

export const OAuth2ClientsDetails = DefaultRenderer => ({ ...otherParams }) => {
  const Secret = resource => (
    <SecretComponent
      key="secret"
      namespaceName={resource.metadata.namespace}
      secretName={resource.spec.secretName}
    />
  );
  const Configuration = resource => (
    <OAuthClientSpecPanel key="configuration" spec={resource.spec} />
  );

  const statusColumn = {
    header: 'Status',
    value: client => <OAuth2ClientStatus client={client} />,
  };

  return (
    <DefaultRenderer
      customColumns={[statusColumn]}
      customComponents={[Configuration, Secret]}
      {...otherParams}
    />
  );
};
