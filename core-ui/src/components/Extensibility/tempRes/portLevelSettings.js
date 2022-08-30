import { loadBalancer } from 'components/Extensibility/tempRes/loadBalancer';
import { connectionPool } from 'components/Extensibility/tempRes/connectionPool';
import { outlierDetection } from 'components/Extensibility/tempRes/outlierDetection';
import { tls } from 'components/Extensibility/tempRes/tls';
import { tunnel } from 'components/Extensibility/tempRes/tunnel';

export const portLevelSettings = () => ({
  source: '$parent.portLevelSettings',
  name: 'portLevelSettings',
  widget: 'Table',
  children: [{ source: '$item.port.number', name: 'port' }],
  collapsible: [
    loadBalancer('$item.'),
    connectionPool('$item.'),
    outlierDetection('$item.'),
    tls('$item.'),
    tunnel('$item.'),
  ],
});
