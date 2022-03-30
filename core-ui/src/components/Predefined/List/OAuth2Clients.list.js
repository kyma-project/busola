import React from 'react';
import { OAuth2ClientStatus } from 'shared/components/OAuth2ClientStatus/OAuth2ClientStatus';
import { useTranslation } from 'react-i18next';
import { ResourcesList } from 'shared/components/ResourcesList/ResourcesList';
import { Link } from 'shared/components/Link/Link';
import { Trans } from 'react-i18next';
import { OAuth2ClientsCreate } from '../Create/OAuthClients/OAuthClients.create';

const OAuth2ClientsList = props => {
  const { t } = useTranslation();

  const customColumns = [
    {
      header: t('oauth2-clients.headers.secret'),
      value: client => {
        return client.spec.secretName;
      },
    },
    {
      header: t('common.headers.status'),
      value: client => <OAuth2ClientStatus client={client} />,
    },
  ];

  const description = (
    <Trans i18nKey="oauth2-clients.description">
      <Link
        className="fd-link"
        url="https://kyma-project.io/docs/kyma/latest/03-tutorials/00-api-exposure/apix-03-expose-and-secure-service#register-an-o-auth2-client-and-get-tokens"
      />
    </Trans>
  );

  return (
    <ResourcesList
      customColumns={customColumns}
      description={description}
      resourceName={t('oauth2-clients.title')}
      createResourceForm={OAuth2ClientsCreate}
      {...props}
    />
  );
};

export default OAuth2ClientsList;
