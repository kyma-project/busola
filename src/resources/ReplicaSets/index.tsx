import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { predefinedCategories } from 'state/navigation/categories';
import { Description } from 'shared/components/Description/Description';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';

export const resourceType = 'ReplicaSets';
export const namespaced = true;
export const apiGroup = 'apps';
export const apiVersion = 'v1';
export const category = predefinedCategories.workloads;

export const i18nDescriptionKey = 'replica-sets.description';
export const docsURL =
  'https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/';

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);

export const List = lazyWithRetries(() => import('./ReplicaSetList'));
export const Details = lazyWithRetries(() => import('./ReplicaSetDetails'));
export const Create = lazyWithRetries(() => import('./ReplicaSetCreate'));

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
});
