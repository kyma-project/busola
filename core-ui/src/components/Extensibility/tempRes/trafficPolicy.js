import { loadBalancer } from 'components/Extensibility/tempRes/loadBalancer';
import { connectionPool } from 'components/Extensibility/tempRes/connectionPool';
import { outlierDetection } from 'components/Extensibility/tempRes/outlierDetection';
import { tls } from 'components/Extensibility/tempRes/tls';

export const trafficPolicy = prefix => ({
  source: prefix + 'trafficPolicy',
  name: 'trafficPolicy',
  visibility: '$exists($.data)',
  widget: 'Panel',
  children: [
    loadBalancer(prefix + 'trafficPolicy.'),
    connectionPool(prefix + 'trafficPolicy.'),
    outlierDetection(prefix + 'trafficPolicy.'),
    tls(prefix + 'trafficPolicy.'),
  ],
});
