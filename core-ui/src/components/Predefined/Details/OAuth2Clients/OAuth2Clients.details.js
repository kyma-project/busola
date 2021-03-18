import React from 'react';

import SecretData from 'components/Secrets/Details/Secret/SecretData';
import OAuthClientSpecPanel from './OAuthClientSpecPanel';

import { useGet } from 'react-shared';

function SecretComponent({ namespaceName, secretName }) {
  const {
    data: secret,
    error,
    loading = true,
  } = useGet(`/api/v1/namespaces/${namespaceName}/secrets/${secretName}`, {
    pollingInterval: 5000,
  });

  if (loading) return 'Loading...';
  if (error) return `Error: ${error.message}`;

  return <SecretData secret={secret} />;
}

export const OAuth2ClientsDetails = DefaultRenderer => ({ ...otherParams }) => {
  const Secret = resource => (
    <SecretComponent
      namespaceName={resource.metadata.namespace}
      secretName={resource.spec.secretName}
    />
  );
  const Configuration = resource => (
    <OAuthClientSpecPanel spec={resource.spec} />
  );

  return (
    <DefaultRenderer
      customComponents={[Configuration, Secret]}
      {...otherParams}
    />
  );
};
