import { loadBalancer } from 'components/Extensibility/tempRes/loadBalancer';
import { connectionPool } from 'components/Extensibility/tempRes/connectionPool';

export const trafficPolicy = prefix => ({
  source: prefix + 'trafficPolicy',
  name: 'trafficPolicy',
  visibility: '$exists($.data)',
  widget: 'Panel',
  children: [
    loadBalancer(prefix + 'trafficPolicy.'),
    connectionPool(prefix + 'trafficPolicy.'),
  ],
});
