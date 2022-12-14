import React from 'react';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'OAuth2Clients';
export const namespaced = true;
export const resourceI18Key = 'oauth2-clients.title';

export const List = React.lazy(() => import('./OAuth2ClientList'));
export const Details = React.lazy(() => import('./OAuth2ClientDetails'));
export const apiGroup = 'hydra.ory.sh';
export const apiVersion = 'v1alpha1';
export const category = predefinedCategories.configuration;

export const secrets = t => [
  {
    title: t('oauth2-clients.secret'),
    data: ['client_id', 'client_secret'],
  },
];

export const resourceGraphConfig = () => ({
  relations: [
    {
      resource: { kind: 'Secret' },
      filter: (client, secret) =>
        client.spec.secretName === secret.metadata.name,
    },
  ],
});
