import { trafficPolicy } from './trafficPolicy';
import { subsets } from 'components/Extensibility/tempRes/subsets';

export const tempDetails = {
  header: [],
  body: [
    {
      name: 'references',
      widget: 'Panel',
      children: [
        {
          source: 'spec.host',
          name: 'Host',
        },
        {
          source: 'spec.exportTo',
          widget: 'Labels',
          name: 'exportTo',
          visibility: '$count(data)',
        },
        {
          source: 'spec.matchLabels',
          widget: 'Labels',
          name: 'matchLabels',
          visibility: '$count(data)',
        },
      ],
    },
    trafficPolicy('spec.'),
    subsets('spec.'),
  ],
};
