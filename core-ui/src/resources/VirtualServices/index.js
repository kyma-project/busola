import React from 'react';
import { ConfigFeaturesNames } from 'state/types';
import { PredefinedCategories } from 'sidebar/constants';

export const resourceType = 'VirtualServices';
export const namespaced = true;
export const requiredFeatures = [ConfigFeaturesNames.ISTIO];
export const apiGroup = 'networking.istio.io';
export const apiVersion = 'v1beta1';
export const category = PredefinedCategories.istio;

export const List = React.lazy(() => import('./VirtualServiceList'));
export const Details = React.lazy(() => import('./VirtualServiceDetails'));

export const resourceGraphConfig = (t, context) => ({
  networkFlowKind: true,
  networkFlowLevel: -2,
  relations: [
    {
      resource: { kind: 'Gateway', namespace: null },
      filter: (vs, gateway) =>
        vs.spec.gateways.some(g => {
          const [name, namespace] = g.split('.');
          return (
            name === gateway.metadata.name &&
            namespace === gateway.metadata.namespace
          );
        }),
    },
    {
      resource: { kind: 'Service' },
      filter: (vs, service) =>
        vs.spec.http.some(h =>
          h.route.some(r => {
            const [name, namespace] = r.destination?.host.split('.');
            return (
              name === service.metadata.name &&
              namespace === service.metadata.namespace
            );
          }),
        ),
    },
  ],
});
