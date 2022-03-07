export const TSL_MODES = [
  'SIMPLE',
  'PASSTHROUGH',
  'MUTUAL',
  'AUTO_PASSTHROUGH',
  'ISTIO_MUTUAL',
];

export const PROTOCOLS = [
  'HTTP',
  'HTTP2',
  'HTTPS',
  'GRPC',
  'MONGO',
  'TCP',
  'TLS',
];

export const DEFAULT_PORTS = {
  HTTP: 80,
  HTTP2: 80,
  HTTPS: 443,
  GRPC: 32767,
  MONGO: 27017,
  TLS: 443,
};

export const TLS_VERSIONS = {
  TLS_AUTO: 'Auto',
  TLSV1_0: 'TLS v1.0',
  TLSV1_1: 'TLS v1.1',
  TLSV1_2: 'TLS v1.2',
  TLSV1_3: 'TLS v1.3',
};

export function isTLSProtocol(protocol) {
  return protocol === 'HTTPS' || protocol === 'TLS';
}

export function isHTTPProtocol(protocol) {
  return protocol === 'HTTP';
}

export function validateTLS(server) {
  if (!server?.tls) return true;

  const { mode, credentialName, privateKey, serverCertificate } = server.tls;

  const hasSecret = !!credentialName;
  const hasKeyAndCertificate = !!privateKey && !!serverCertificate;

  const isSimpleOrMutual = mode === 'SIMPLE' || mode === 'MUTUAL';
  return !isSimpleOrMutual || hasSecret || hasKeyAndCertificate;
}

export function validateGateway(gateway) {
  const hasName = !!gateway?.metadata?.name;
  const hasServer = gateway?.spec?.servers?.length;
  const hasSelector = Object.keys(gateway?.spec?.selector || {}).length;
  const serversHaveHosts = gateway?.spec?.servers?.every(s => s?.hosts?.length);
  const tlsValid = gateway?.spec?.servers?.every(validateTLS);

  return hasName && hasServer && hasSelector && serversHaveHosts && tlsValid;
}
