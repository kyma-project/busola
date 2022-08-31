export const outlierDetection = {
  path: 'outlierDetection',
  widget: 'FormGroup',
  children: [
    {
      path: 'splitExternalLocalOriginErrors',
      name: 'Split External Local Origin Errors',
    },
    {
      path: 'consecutiveLocalOriginFailures',
      name: 'Consecutive Local Origin Failures',
      type: 'number',
    },
    {
      path: 'consecutiveGatewayErrors',
      name: 'Consecutive Gateway Errors',
      type: 'number',
    },
    {
      path: 'consecutive5xxErrors',
      name: 'Consecutive 5xx Errors',
      type: 'number',
    },
    { path: 'interval', name: 'Interval' },
    { path: 'baseEjectionTime', name: 'Base Ejection Time' },
    { path: 'maxEjectionPercent', name: 'Max Ejection Percent' },
    { path: 'minHealthPercent', name: 'Min Health Percent' },
  ],
};

const outlierDetectionGenericListSyntax = { ...outlierDetection };
outlierDetectionGenericListSyntax.path = '[].outlierDetection';
export { outlierDetectionGenericListSyntax };
