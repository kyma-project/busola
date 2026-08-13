import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { Description } from 'shared/components/Description/Description';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';

export const resourceType = 'PodDisruptionBudgets';
export const namespaced = true;
export const apiGroup = 'policy';
export const apiVersion = 'v1';

export const List = lazyWithRetries(() => import('./PodDisruptionBudgetsList'));
export const Details = lazyWithRetries(
  () => import('./PodDisruptionBudgetDetails'),
);
export const Create = lazyWithRetries(
  () => import('./PodDisruptionBudgetCreate'),
);

export const i18nDescriptionKey = 'pod-disruption-budgets.description';
export const docsURL =
  'https://kubernetes.io/docs/concepts/workloads/pods/disruptions/';

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
  depth: 1,
});
