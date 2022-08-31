import { loadBalancer } from './loadBalancer';
import { connectionPool } from './connectionPool';
import { outlierDetection } from './outlierDetection';
import { tls } from './tls';
import { tunnel } from './tunnel';

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
