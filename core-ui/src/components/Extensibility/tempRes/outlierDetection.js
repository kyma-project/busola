export const outlierDetection = prefix => ({
  source: prefix + 'outlierDetection',
  name: 'outlierDetection',
  visibility: '$exists($.data)',
  widget: 'Panel',
  children: [
    {
      source: '$parent.splitExternalLocalOriginErrors',
      name: 'splitExternalLocalOriginErrors',
      visibility: '$exists($.data)',
      widget: 'Badge',
      highlights: {
        positive: ['true'],
        negative: ['false'],
      },
    },
    {
      source: '$parent.consecutiveLocalOriginFailures',
      name: 'consecutiveLocalOriginFailures',
      visibility: '$exists($.data)',
    },
    {
      source: '$parent.consecutiveGatewayErrors',
      name: 'consecutiveGatewayErrors',
      visibility: '$exists($.data)',
      type: 'number',
    },
    {
      source: '$parent.consecutive5xxErrors',
      name: 'consecutive5xxErrors',
      visibility: '$exists($.data)',
    },
    {
      source: '$parent.interval',
      name: 'interval',
      visibility: '$exists($.data)',
    },
    {
      source: '$parent.baseEjectionTime',
      name: 'baseEjectionTime',
      visibility: '$exists($.data)',
    },
    {
      source: '$parent.maxEjectionPercent',
      name: 'maxEjectionPercent',
      visibility: '$exists($.data)',
    },
    {
      source: '$parent.minHealthPercent',
      name: 'minHealthPercent',
      visibility: '$exists($.data)',
    },
  ],
});
