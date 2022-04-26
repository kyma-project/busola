import React from 'react';

export const resourceType = 'ServiceAccounts';
export const namespaced = true;

export const List = React.lazy(() => import('./ServiceAccountList'));
export const Details = React.lazy(() => import('./ServiceAccountDetails'));

export const resourceGraphConfig = (t, context) => ({
  relations: [
    {
      kind: 'ClusterRoleBinding',
    },
    {
      kind: 'RoleBinding',
    },
    {
      kind: 'Secret',
    },
  ],
  depth: 2,
  networkFlowLevel: 2,
  matchers: {
    Secret: (sa, secret) =>
      sa.secrets?.find(s => s.name === secret.metadata.name) ||
      sa.imagePullSecrets?.find(s => s.name === secret.metadata.name),
  },
});
