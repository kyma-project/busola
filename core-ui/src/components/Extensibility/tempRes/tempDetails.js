import { trafficPolicy } from './trafficPolicy';
import { subsets } from 'components/Extensibility/tempRes/subsets';

export const tempDetails = {
  header: [],
  body: [
    {
      name: 'References',
      widget: 'Panel',
      children: [
        {
          source: 'spec.host',
          name: 'Host',
        },
        {
          source: 'spec.exportTo',
          widget: 'Labels',
          name: 'Export To',
          visibility: '$count(data)',
        },
        {
          source: 'spec.workloadSelector.matchLabels',
          widget: 'Labels',
          name: 'Workload Selector / Match Labels',
          visibility: '$count(data)',
        },
      ],
    },
    trafficPolicy('spec.'),
    subsets('spec.'),
  ],
};
