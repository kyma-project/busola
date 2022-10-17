import React from 'react';

import { matchByOwnerReference, matchBySelector } from 'shared/utils/helpers';
import { PredefinedCategories } from 'sidebar/constants';

export const resourceType = 'Deployments';
export const namespaced = true;
export const apiGroup = 'apps';
export const apiVersion = 'v1';
export const category = PredefinedCategories.workloads;

export const List = React.lazy(() => import('./DeploymentList'));
export const Details = React.lazy(() => import('./DeploymentDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -2,
  relations: [
    {
      resource: { kind: 'HorizontalPodAutoscaler' },
      filter: (deployment, hpa) =>
        hpa.spec.scaleTargetRef?.kind === 'Deployment' &&
        hpa.spec.scaleTargetRef?.name === deployment.metadata.name,
    },
    {
      resource: { kind: 'Service' },
      filter: (deployment, service) =>
        matchBySelector(
          deployment.spec.selector.matchLabels,
          service.spec.selector,
        ),
    },
    {
      resource: { kind: 'ReplicaSet' },
      filter: (deployment, replicaSet) =>
        matchByOwnerReference({
          resource: replicaSet,
          owner: deployment,
        }),
    },
  ],
});
