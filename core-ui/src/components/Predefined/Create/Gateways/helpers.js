export const TSL_MODES = [
  'SIMPLE',
  'PASSTHROUGH',
  'MUTUAL',
  'AUTO_PASSTHROUGH',
  'ISTIO_MUTUAL',
];

export const PROTOCOLS = ['HTTP', 'HTTP2', 'HTTPS', 'GRPC', 'MONGO', 'TCP'];

export const DEFAULT_PORTS = {
  HTTP: 80,
  HTTP2: 80,
  HTTPS: 443,
  GRPC: 32767,
  MONGO: 27017,
};

export const TLS_VERSIONS = {
  TLS_AUTO: 'Auto',
  TLSV1_0: 'TLS v1.0',
  TLSV1_1: 'TLS v1.1',
  TLSV1_2: 'TLS v1.2',
  TLSV1_3: 'TLS v1.3',
};

export function validateTLS(server) {
  if (!server?.tls) return false;

  const { mode, credentialName, privateKey, serverCertificate } = server.tls;

  const hasSecret = !!credentialName;
  const hasKeyAndCertificate = !!privateKey && !!serverCertificate;

  const isSimpleOrMutual = mode === 'SIMPLE' || mode === 'MUTUAL';
  return !isSimpleOrMutual || hasSecret || hasKeyAndCertificate;
}

export function validateGateway(gateway) {
  const hasServer = gateway?.spec?.servers?.length;
  const hasSelector = Object.keys(gateway?.spec?.selector || {}).length;
  const serversHaveHosts = gateway?.spec?.servers?.every(s => s?.hosts?.length);
  const tlsValid = gateway?.spec?.servers?.every(validateTLS);

  return hasServer && hasSelector && serversHaveHosts && tlsValid;
}
