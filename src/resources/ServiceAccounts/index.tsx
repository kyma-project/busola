import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { predefinedCategories } from 'state/navigation/categories';
import { Description } from 'shared/components/Description/Description';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';

export const resourceType = 'ServiceAccounts';
export const namespaced = true;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = predefinedCategories.configuration;

export const i18nDescriptionKey = 'service-accounts.description';
export const docsURL =
  'https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/';

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);

export const List = lazyWithRetries(() => import('./ServiceAccountList'));
export const Details = lazyWithRetries(() => import('./ServiceAccountDetails'));
export const Create = lazyWithRetries(() => import('./ServiceAccountCreate'));

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
