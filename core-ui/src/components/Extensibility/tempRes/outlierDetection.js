export const outlierDetection = prefix => ({
  source: prefix + 'outlierDetection',
  name: 'outlierDetection',
  visibility: '$exists($.data)',
  widget: 'Panel',
  children: [
    {
      source: prefix + 'outlierDetection.splitExternalLocalOriginErrors',
      name: 'splitExternalLocalOriginErrors',
      visibility: '$exists($.data)',
      widget: 'Badge',
      highlights: {
        positive: ['true'],
        negative: ['false'],
      },
    },
    {
      source: prefix + 'outlierDetection.consecutiveLocalOriginFailures',
      name: 'consecutiveLocalOriginFailures',
      visibility: '$exists($.data)',
    },
    {
      source: prefix + 'outlierDetection.consecutiveGatewayErrors',
      name: 'consecutiveGatewayErrors',
      visibility: '$exists($.data)',
      type: 'number',
    },
    {
      source: prefix + 'outlierDetection.consecutive5xxErrors',
      name: 'consecutive5xxErrors',
      visibility: '$exists($.data)',
    },
    {
      source: prefix + 'outlierDetection.interval',
      name: 'interval',
      visibility: '$exists($.data)',
    },
    {
      source: prefix + 'outlierDetection.baseEjectionTime',
      name: 'baseEjectionTime',
      visibility: '$exists($.data)',
    },
    {
      source: prefix + 'outlierDetection.maxEjectionPercent',
      name: 'maxEjectionPercent',
      visibility: '$exists($.data)',
    },
    {
      source: prefix + 'outlierDetection.minHealthPercent',
      name: 'minHealthPercent',
      visibility: '$exists($.data)',
    },
  ],
});
