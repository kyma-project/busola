export const outlierDetection = prefix => ({
  source: prefix + 'outlierDetection',
  name: 'outlierDetection',
  visibility: '$exists($.data)',
  widget: 'Panel',
  children: [
    {
      source: '$parent.splitExternalLocalOriginErrors',
      name: 'Split External Local Origin Errors',
      visibility: '$exists($.data)',
      widget: 'Badge',
      highlights: {
        positive: ['true'],
        negative: ['false'],
      },
    },
    {
      source: '$parent.consecutiveLocalOriginFailures',
      name: 'Consecutive Local Origin Failures',
      visibility: '$exists($.data)',
    },
    {
      source: '$parent.consecutiveGatewayErrors',
      name: 'Consecutive Gateway Errors',
      visibility: '$exists($.data)',
      type: 'number',
    },
    {
      source: '$parent.consecutive5xxErrors',
      name: 'Consecutive 5xx Errors',
      visibility: '$exists($.data)',
    },
    {
      source: '$parent.interval',
      name: 'Interval',
      visibility: '$exists($.data)',
    },
    {
      source: '$parent.baseEjectionTime',
      name: 'Base Ejection Time',
      visibility: '$exists($.data)',
    },
    {
      source: '$parent.maxEjectionPercent',
      name: 'Max Ejection Percent',
      visibility: '$exists($.data)',
    },
    {
      source: '$parent.minHealthPercent',
      name: 'Min Health Percent',
      visibility: '$exists($.data)',
    },
  ],
});
