import React from 'react';

import { matchBySelector } from 'shared/utils/helpers';

export const resourceType = 'NetworkPolicies';
export const namespaced = true;

export const List = React.lazy(() => import('./NetworkPolicyList'));
export const Details = React.lazy(() => import('./NetworkPolicyDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -1,
  relations: [
    {
      kind: 'Pod',
    },
  ],
  matchers: {
    Pod: (policy, pod) =>
      matchBySelector(policy.spec.podSelector.matchLabels, pod.metadata.labels),
  },
});
