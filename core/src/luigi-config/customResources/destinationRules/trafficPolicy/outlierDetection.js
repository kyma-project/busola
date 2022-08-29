export const outlierDetection = {
  path: 'outlierDetection',
  widget: 'FormGroup',
  children: [
    { path: 'splitExternalLocalOriginErrors' },
    { path: 'consecutiveLocalOriginFailures', type: 'number' },
    { path: 'consecutiveGatewayErrors', type: 'number' },
    { path: 'consecutive5xxErrors', type: 'number' },
    { path: 'interval' },
    { path: 'baseEjectionTime' },
    { path: 'maxEjectionPercent' },
    { path: 'minHealthPercent' },
  ],
};

const outlierDetectionGenericListSyntax = { ...outlierDetection };
outlierDetectionGenericListSyntax.path = '[].outlierDetection';
export { outlierDetectionGenericListSyntax };
