import { loadBalancer } from 'components/Extensibility/tempRes/loadBalancer';
import { connectionPool } from 'components/Extensibility/tempRes/connectionPool';
import { outlierDetection } from 'components/Extensibility/tempRes/outlierDetection';
import { tls } from 'components/Extensibility/tempRes/tls';
import { portLevelSettings } from 'components/Extensibility/tempRes/portLevelSettings';
import { tunnel } from 'components/Extensibility/tempRes/tunnel';

export const trafficPolicy = prefix => ({
  source: prefix + 'trafficPolicy',
  name: 'trafficPolicy',
  visibility: '$exists($.data)',
  widget: 'Panel',
  children: [
    { source: '$parent.loadBalancer', widget: 'CodeViewer' },
    loadBalancer(prefix + 'trafficPolicy.'),
    connectionPool(prefix + 'trafficPolicy.'),
    outlierDetection(prefix + 'trafficPolicy.'),
    tls(prefix + 'trafficPolicy.'),
    portLevelSettings(prefix + 'trafficPolicy.'),
    tunnel(prefix + 'trafficPolicy.'),
  ],
});
