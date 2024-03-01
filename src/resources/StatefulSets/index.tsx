import React from 'react';
import { ResourceRelationConfig } from 'shared/components/ResourceGraph/types';
import { Description } from 'shared/components/Description/Description';
import { matchByOwnerReference } from 'shared/utils/helpers';
import { predefinedCategories } from 'state/navigation/categories';

export const resourceType = 'StatefulSets';
export const namespaced = true;
export const apiGroup = 'apps';
export const apiVersion = 'v1';
export const category = predefinedCategories.workloads;

export const i18nDescriptionKey = 'stateful-sets.description';
export const docsURL =
  'https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/';

export const ResourceDescription = (
  <Description i18nKey={i18nDescriptionKey} url={docsURL} />
);

export const List = React.lazy(() => import('./StatefulSetList'));
export const Details = React.lazy(() => import('./StatefulSetDetails'));
export const Create = React.lazy(() => import('./StatefulSetCreate'));

export const resourceGraphConfig = (): ResourceRelationConfig => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
  relations: [
    {
      resource: { kind: 'Pod' },
      filter: (ss, pod) =>
        matchByOwnerReference({
          resource: pod,
          owner: ss,
        }),
    },
  ],
});
