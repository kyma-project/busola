import React from 'react';

import { matchBySelector } from 'shared/utils/helpers';

export const resourceType = 'NetworkPolicies';
export const namespaced = true;
export const apiGroup = 'networking.k8s.io';
export const apiVersion = 'v1';

export const List = React.lazy(() => import('./NetworkPolicyList'));
export const Details = React.lazy(() => import('./NetworkPolicyDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
  relations: [
    {
      resource: { kind: 'Pod' },
      filter: (policy, pod) =>
        matchBySelector(
          policy.spec.podSelector.matchLabels,
          pod.metadata.labels,
        ),
    },
  ],
});
