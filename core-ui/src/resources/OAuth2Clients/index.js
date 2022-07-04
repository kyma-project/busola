import React from 'react';

export const resourceType = 'OAuth2Clients';
export const namespaced = true;
export const resourceI18Key = 'oauth2-clients.title';

export const List = React.lazy(() => import('./OAuth2ClientList'));
export const Details = React.lazy(() => import('./OAuth2ClientDetails'));

export const secrets = (t, context) => [
  {
    title: t('oauth2-clients.secret'),
    data: ['client_id', 'client_secret'],
  },
];

export const resourceGraphConfig = (t, context) => ({
  relations: [
    {
      kind: 'Secret',
    },
  ],
  matchers: {
    Secret: (client, secret) => client.spec.secretName === secret.metadata.name,
  },
});
