import { trafficPolicyBundle } from './trafficPolicy/trafficPolicyBundle';
import { subsets } from './subsets';

export const form = [
  {
    simple: true,
    path: 'spec.host',
    name: 'Host',
  },
  {
    widget: 'FormGroup',
    path: 'spec.trafficPolicy',
    name: 'Traffic Policy',
    children: trafficPolicyBundle,
  },
  subsets,
  { path: 'spec.exportTo', name: 'Export To', widget: 'SimpleList' },
  {
    path: 'spec.workloadSelector.matchLabels',
    name: 'Workload Selector / Match Labels',
    widget: 'KeyValuePair',
  },
];
