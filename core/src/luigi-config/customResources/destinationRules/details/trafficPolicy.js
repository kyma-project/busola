import { loadBalancer } from './loadBalancer';
import { connectionPool } from './connectionPool';
import { outlierDetection } from './outlierDetection';
import { tls } from './tls';
import { portLevelSettings } from './portLevelSettings';
import { tunnel } from './tunnel';

export const trafficPolicy = prefix => ({
  source: `${prefix}trafficPolicy`,
  name: 'Traffic Policy',
  visibility: '$exists($.data)',
  widget: 'Panel',
  children: [
    loadBalancer('$parent.'),
    connectionPool('$parent.'),
    outlierDetection('$parent.'),
    tls('$parent.'),
    portLevelSettings('$parent.'),
    tunnel('$parent.'),
  ],
});
