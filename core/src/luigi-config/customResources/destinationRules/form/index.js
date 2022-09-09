import { subsets } from './subsets';
import { loadBalancer } from './trafficPolicy/loadBalancer';
import { connectionPool } from './trafficPolicy/connectionPool';
import { outlierDetection } from './trafficPolicy/outlierDetection';
import { tls } from './trafficPolicy/tls';
import { portLevelSettings } from './trafficPolicy/portLevelSettings';
import { tunnel } from './trafficPolicy/tunnel';

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
  { path: 'spec.exportTo', name: 'Export To', widget: 'SimpleList' },
  {
    path: 'spec.workloadSelector.matchLabels',
    name: 'Workload Selector Match Labels',
    widget: 'KeyValuePair',
  },
];
