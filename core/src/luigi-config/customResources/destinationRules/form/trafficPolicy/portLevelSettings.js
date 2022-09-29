import { loadBalancer } from './loadBalancer';
import { connectionPool } from './connectionPool';
import { outlierDetection } from './outlierDetection';
import { tls } from './tls';

export const portLevelSettings = ({ uniqueVarPrefix }) => ({
  path: 'portLevelSettings',
  name: 'Port Level Settings',
  widget: 'GenericList',
  children: [
    { path: '[].port.number', name: 'Port Number' },
    loadBalancer({ uniqueVarPrefix, isArray: true }),
    connectionPool({ isArray: true }),
    outlierDetection({ isArray: true }),
    tls({ isArray: true }),
  ],
});
