import React from 'react';
import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'ServiceAccounts';
export const namespaced = true;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = predefinedCategories.configuration;

export const serviceAccountI18nDescriptionKey = 'service-accounts.description';
export const serviceAccountDocsURL =
  'https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/';

export const List = React.lazy(() => import('./ServiceAccountList'));
export const Details = React.lazy(() => import('./ServiceAccountDetails'));

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  depth: 2,
  networkFlowLevel: 2,
  relations: [
    {
      resource: { kind: 'Secret' },
      filter: (sa, secret) => {
        const secretAnnotations = Object.entries(
          secret.metadata.annotations ?? {},
        );
        return (
          secretAnnotations.find(
            ([key, value]) =>
              key === 'kubernetes.io/service-account.name' &&
              value === sa.metadata.name,
          ) ||
          sa.imagePullSecrets?.find((s: any) => s.name === secret.metadata.name)
        );
      },
    },
  ],
});
