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
          widget: 'JoinedArray',
          separator: ', ',
        },
      ],
    },
    trafficPolicy('spec.'),
    subsets('spec.'),
    {
      source: 'spec.trafficPolicy',
      name: 'spec.trafficPolicy',
      widget: 'CodeViewer',
      visibility: '$exists($.data)',
    },
    // {
    //   source: 'spec.subset',
    //   widget: 'CodeViewer',
    //   visibility: '$exists($.data)',
    // },
    // {
    //   source: 'spec.workloadSelector',
    //   widget: 'CodeViewer',
    //   visibility: '$exists($.data)',
    // },
  ],
};
