import { trafficPolicy } from './trafficPolicy';

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

    {
      source: 'spec.trafficPolicy',
      name: 'spec.trafficPolicy',
      widget: 'CodeViewer',
      // visibility: '$exists($.data)',
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
