import { loadBalancer } from './loadBalancer.mjs';
import { connectionPool } from './connectionPool.mjs';
import { outlierDetection } from './outlierDetection.mjs';
import { tls } from './tls.mjs';
import { tunnel } from './tunnel.mjs';

export const portLevelSettings = () => ({
  source: '$parent.portLevelSettings',
  name: 'portLevelSettings',
  widget: 'Table',
  children: [{ source: '$item.port.number', name: 'port' }],
  visibility: '$count(data)',
  collapsible: [
    loadBalancer('$item.'),
    connectionPool('$item.'),
    outlierDetection('$item.'),
    tls('$item.'),
    tunnel('$item.'),
  ],
});
