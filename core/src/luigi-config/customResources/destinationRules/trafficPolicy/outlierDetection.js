export const outlierDetection = {
  path: 'outlierDetection',
  widget: 'FormGroup',
  children: [
    { path: 'splitExternalLocalOriginErrors' },
    { path: 'consecutiveLocalOriginFailures' },
    { path: 'consecutiveGatewayErrors' },
    { path: 'consecutive5xxErrors' },
    { path: 'interval' },
    { path: 'baseEjectionTime' },
    { path: 'maxEjectionPercent' },
    { path: 'minHealthPercent' },
  ],
};
