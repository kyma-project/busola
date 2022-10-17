import { subsets } from './subsets.mjs';
import { loadBalancer } from './trafficPolicy/loadBalancer.mjs';
import { connectionPool } from './trafficPolicy/connectionPool.mjs';
import { outlierDetection } from './trafficPolicy/outlierDetection.mjs';
import { tls } from './trafficPolicy/tls.mjs';
import { portLevelSettings } from './trafficPolicy/portLevelSettings.mjs';
import { tunnel } from './trafficPolicy/tunnel.mjs';

export const form = [
  {
    simple: true,
    path: 'spec.host',
    name: 'Host',
    required: true,
  },
  {
    widget: 'FormGroup',
    path: 'spec.trafficPolicy',
    name: 'Traffic Policy',
    children: [
      loadBalancer({ uniqueVarPrefix: 'main', isArray: false }),
      connectionPool({ isArray: false }),
      outlierDetection({ isArray: false }),
      tls({ isArray: false }),
      portLevelSettings({ uniqueVarPrefix: 'portLevel' }),
      tunnel,
    ],
  },
  subsets,
  {
    path: 'spec.exportTo',
    name: 'Export To',
    widget: 'SimpleList',
    children: [{ path: '[]' }],
  },
  {
    path: 'spec.workloadSelector.matchLabels',
    name: 'Workload Selector Match Labels',
    widget: 'KeyValuePair',
  },
];
