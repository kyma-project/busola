export const TSL_MODES = [
  // 'PASSTHROUGH',
  'SIMPLE',
  // 'MUTUAL',
  // 'AUTO_PASSTHROUGH',
  // 'ISTIO_MUTUAL',
];

export const PROTOCOLS = ['HTTP', 'HTTP2', 'HTTPS', 'GRPC', 'MONGO', 'TCP'];

export function validateGateway(gateway) {
  const hasServer = gateway?.spec?.servers?.length;
  const hasSelector = Object.keys(gateway?.spec?.selector || {}).length;
  const serversHaveHosts = gateway?.spec?.servers?.every(s => s?.hosts?.length);

  return hasServer && hasSelector && serversHaveHosts;
}
