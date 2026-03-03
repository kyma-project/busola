import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { Description } from 'shared/components/Description/Description';

import { matchByOwnerReference } from 'shared/utils/helpers';
import { predefinedCategories } from 'state/navigation/categories';
import { lazyWithRetries } from 'shared/helpers/lazyWithRetries';

export const resourceType = 'DaemonSets';
export const namespaced = true;
export const apiGroup = 'apps';
export const apiVersion = 'v1';
export const category = predefinedCategories.workloads;

export const i18nDescriptionKey = 'daemon-sets.description';
export const docsURL =
  'https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/';

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);

export const List = lazyWithRetries(() => import('./DaemonSetList'));
export const Details = lazyWithRetries(() => import('./DaemonSetDetails'));
export const Create = lazyWithRetries(() => import('./DaemonSetCreate'));

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
  relations: [
    {
      resource: { kind: 'Pod' },
      filter: (ds, pod) =>
        matchByOwnerReference({
          resource: pod,
          owner: ds,
        }),
    },
  ],
});
