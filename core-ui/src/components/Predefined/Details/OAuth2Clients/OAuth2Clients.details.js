import React from 'react';

import SecretData from 'shared/components/Secret/SecretData';
import OAuthClientSpecPanel from './OAuthClientSpecPanel';
import { OAuth2ClientStatus } from 'shared/components/OAuth2ClientStatus/OAuth2ClientStatus';
import { useTranslation } from 'react-i18next';

import { useGet } from 'react-shared';

import './OAuth2ClientsDetails.scss';

function SecretComponent({ namespaceName, secretName }) {
  const { t } = useTranslation();
  const { data: secret, error, loading = true } = useGet(
    `/api/v1/namespaces/${namespaceName}/secrets/${secretName}`,
    {
      pollingInterval: 5000,
    },
  );

  if (loading) return t('common.headers.loading');
  if (error) return `${t('common.tooltips.error')} ${error.message}`;

  return <SecretData secret={secret} />;
}

export const OAuth2ClientsDetails = ({ DefaultRenderer, ...otherParams }) => {
  const { t } = useTranslation();

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
    header: t('common.headers.status'),
    value: client => <OAuth2ClientStatus client={client} />,
  };

  return (
    <DefaultRenderer
      resourceTitle={t('oauth2-clients.title')}
      customColumns={[statusColumn]}
      customComponents={[Configuration, Secret]}
      {...otherParams}
    />
  );
};
