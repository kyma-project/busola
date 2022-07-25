import React from 'react';

export const resourceType = 'Secrets';
export const namespaced = true;

export const List = React.lazy(() => import('./SecretList'));
export const Details = React.lazy(() => import('./SecretDetails'));

export const secrets = (t, context) => [
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

export const resourceGraphConfig = (t, context) => ({
  relations: [
    {
      kind: 'Pod',
    },
    {
      kind: 'ServiceAccount',
    },
    {
      kind: 'Ingress',
    },
    {
      kind: 'OAuth2Client',
    },
    {
      kind: 'Gateway',
      clusterwide: true,
    },
    {
      kind: 'StorageClass',
      clusterwide: true,
    },
  ],
  depth: 1,
  networkFlowLevel: 1,
});
