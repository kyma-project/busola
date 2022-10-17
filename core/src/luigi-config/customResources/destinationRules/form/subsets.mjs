import { loadBalancer } from './trafficPolicy/loadBalancer.mjs';
import { connectionPool } from './trafficPolicy/connectionPool.mjs';
import { outlierDetection } from './trafficPolicy/outlierDetection.mjs';
import { tls } from './trafficPolicy/tls.mjs';
import { portLevelSettings } from './trafficPolicy/portLevelSettings.mjs';
import { tunnel } from './trafficPolicy/tunnel.mjs';

export const subsets = {
  path: 'spec.subsets',
  name: 'Subsets',
  widget: 'GenericList',
  children: [
    { path: '[].name', name: 'Name' },
    { path: '[].labels', name: 'Labels', widget: 'KeyValuePair' },
    {
      path: '[].trafficPolicy',
      name: 'Traffic Policy',
      children: [
        loadBalancer({ uniqueVarPrefix: 'subsets', isArray: false }),
        connectionPool({ isArray: false }),
        outlierDetection({ isArray: false }),
        tls({ isArray: false }),
        portLevelSettings({ uniqueVarPrefix: 'subsetPortLevel' }),
        tunnel,
      ],
    },
  ],
};
