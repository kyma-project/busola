import { loadBalancer } from './loadBalancer.mjs';
import { connectionPool } from './connectionPool.mjs';
import { outlierDetection } from './outlierDetection.mjs';
import { tls } from './tls.mjs';
import { portLevelSettings } from './portLevelSettings.mjs';
import { tunnel } from './tunnel.mjs';

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
