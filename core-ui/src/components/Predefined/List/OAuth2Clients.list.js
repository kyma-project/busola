import React from 'react';
import { OAuth2ClientStatus } from 'shared/components/OAuth2ClientStatus/OAuth2ClientStatus';
import { useTranslation } from 'react-i18next';

export const OAuth2ClientsList = ({ DefaultRenderer, ...otherParams }) => {
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

  return (
    <DefaultRenderer
      customColumns={customColumns}
      resourceName={t('oauth2-clients.title')}
      {...otherParams}
    />
  );
};
