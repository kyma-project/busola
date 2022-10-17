import React from 'react';
import { PredefinedCategories } from 'sidebar/constants';

export const resourceType = 'ServiceAccounts';
export const namespaced = true;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = PredefinedCategories.configuration;

export const List = React.lazy(() => import('./ServiceAccountList'));
export const Details = React.lazy(() => import('./ServiceAccountDetails'));

export const resourceGraphConfig = (t, context) => ({
  depth: 2,
  networkFlowLevel: 2,
  relations: [
    {
      resource: { kind: 'Secret' },
      filter: (sa, secret) =>
        sa.secrets?.find(s => s.name === secret.metadata.name) ||
        sa.imagePullSecrets?.find(s => s.name === secret.metadata.name),
    },
  ],
});
