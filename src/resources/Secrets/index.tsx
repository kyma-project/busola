import React from 'react';
import { predefinedCategories } from 'state/navigation/categories';
import { Description } from 'shared/components/Description/Description';
import { matchByOwnerReference } from 'shared/utils/helpers';

export const resourceType = 'Secrets';
export const namespaced = true;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = predefinedCategories.configuration;

export const i18nDescriptionKey = 'secrets.description';
export const docsURL =
  'https://kubernetes.io/docs/concepts/configuration/secret/';

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);

export const List = React.lazy(() => import('./SecretList'));
export const Details = React.lazy(() => import('./SecretDetails'));
export const Create = React.lazy(() => import('./SecretCreate'));

export const secrets = () => [
  {
    type: 'kubernetes.io/service-account-token',
    data: [],
    metadata: {
      annotations: {
        'kubernetes.io/service-account.name': '',
      },
    },
  },
  {
    type: 'kubernetes.io/dockercfg',
    data: ['.dockercfg'],
  },
  {
    type: 'kubernetes.io/dockerconfigjson',
    data: ['.dockerconfigjson'],
  },
  {
    type: 'kubernetes.io/basic-auth',
    data: ['username', 'password'],
  },
  {
    type: 'kubernetes.io/ssh-auth',
    data: ['ssh-privatekey'],
  },
  {
    type: 'kubernetes.io/tls',
    data: ['tls.crt', 'tls.key'],
  },
  {
    type: 'bootstrap.kubernetes.io/token',
    data: ['token-id', 'token-secret'],
  },
];

export const resourceGraphConfig = () => ({
  depth: 1,
  networkFlowLevel: 1,
  relations: [
    {
      resource: { kind: 'Deployment' },
      filter: (secret: any, deployment: any) =>
        matchByOwnerReference({
          resource: secret,
          owner: deployment,
        }),
    },
  ],
});
