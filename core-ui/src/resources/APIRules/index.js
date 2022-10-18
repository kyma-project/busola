import React from 'react';

import { matchByOwnerReference } from 'shared/utils/helpers';
import { PredefinedCategories } from 'state/navigation/categories';

export const resourceType = 'APIRules';
export const namespaced = true;
export const resourceI18Key = 'api-rules.title';

export const List = React.lazy(() => import('./APIRuleList'));
export const Details = React.lazy(() => import('./APIRuleDetails'));

export const apiGroup = 'gateway.kyma-project.io';
export const apiVersion = 'v1alpha1';
export const category = PredefinedCategories['discovery-and-network'];

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -3,
  relations: [
    {
      resource: { kind: 'Service' },
      filter: (apiRule, service) =>
        apiRule.spec.service?.name === service.metadata.name,
    },
    {
      resource: { kind: 'VirtualService' },
      filter: (apiRule, virtualService) =>
        virtualService.spec.hosts.includes(apiRule.spec.service.host) ||
        matchByOwnerReference({
          resource: virtualService,
          owner: apiRule,
        }),
    },
    {
      resource: { kind: 'Gateway', namespace: null },
      filter: (apiRule, gateway) => {
        const [name, namespace] = apiRule.spec.gateway.split('.');
        return (
          name === gateway.metadata.name &&
          namespace === gateway.metadata.namespace
        );
      },
    },
  ],
});
