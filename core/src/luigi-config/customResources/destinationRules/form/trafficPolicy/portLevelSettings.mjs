import { loadBalancer } from './loadBalancer.mjs';
import { connectionPool } from './connectionPool.mjs';
import { outlierDetection } from './outlierDetection.mjs';
import { tls } from './tls.mjs';

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
