import React from 'react';

import { matchByOwnerReference, matchBySelector } from 'shared/utils/helpers';

export const resourceType = 'Deployments';
export const namespaced = true;

export const List = React.lazy(() => import('./DeploymentList'));
export const Details = React.lazy(() => import('./DeploymentDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -2,
  relations: [
    {
      kind: 'Service',
    },
    {
      kind: 'HorizontalPodAutoscaler',
    },
    {
      kind: 'ReplicaSet',
    },
  ],
  matchers: {
    HorizontalPodAutoscaler: (deployment, hpa) =>
      hpa.spec.scaleTargetRef?.kind === 'Deployment' &&
      hpa.spec.scaleTargetRef?.name === deployment.metadata.name,
    Service: (deployment, service) =>
      matchBySelector(
        deployment.spec.selector.matchLabels,
        service.spec.selector,
      ),
    ReplicaSet: (deployment, replicaSet) =>
      matchByOwnerReference({
        resource: replicaSet,
        owner: deployment,
      }),
  },
});
