import { loadBalancer } from './trafficPolicy/loadBalancer';
import { connectionPool } from './trafficPolicy/connectionPool';
import { outlierDetection } from './trafficPolicy/outlierDetection';
import { tls } from './trafficPolicy/tls';
import { portLevelSettings } from './trafficPolicy/portLevelSettings';
import { tunnel } from './trafficPolicy/tunnel';

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
