import React from 'react';

import { matchByOwnerReference } from 'shared/utils/helpers';

export const resourceType = 'ApiRules';
export const namespaced = true;
export const resourceI18Key = 'api-rules.title';

export const List = React.lazy(() => import('./ApiRuleList'));
export const Details = React.lazy(() => import('./ApiRuleDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -3,
  relations: [
    {
      kind: 'Service',
    },
    {
      kind: 'VirtualService',
    },
    {
      kind: 'Gateway',
      clusterwide: true,
    },
  ],
  matchers: {
    Service: (apiRule, service) =>
      apiRule.spec.service?.name === service.metadata.name,
    VirtualService: (apiRule, virtualService) =>
      virtualService.spec.hosts.includes(apiRule.spec.service.host) ||
      matchByOwnerReference({
        resource: virtualService,
        owner: apiRule,
      }),
    Gateway: (apiRule, gateway) => {
      const [name, namespace] = apiRule.spec.gateway.split('.');
      return (
        name === gateway.metadata.name &&
        namespace === gateway.metadata.namespace
      );
    },
  },
});
