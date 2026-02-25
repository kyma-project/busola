import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { predefinedCategories } from 'state/navigation/categories';
import { Description } from 'shared/components/Description/Description';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';

export const resourceType = 'ResourceQuotas';
export const namespaced = true;
export const apiGroup = '';
export const apiVersion = 'v1';
export const category = predefinedCategories['discovery-and-network'];

export const List = lazyWithRetries(() => import('./ResourceQuotaList'));
export const Details = lazyWithRetries(() => import('./ResourceQuotaDetails'));
export const Create = lazyWithRetries(() => import('./ResourceQuotaCreate'));

export const i18nDescriptionKey = 'resource-quotas.description';
export const docsURL =
  'https://kubernetes.io/docs/concepts/policy/resource-quotas/';

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
  depth: 1,
});
