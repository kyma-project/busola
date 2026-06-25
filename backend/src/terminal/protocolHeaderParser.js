// TODO: implement stricter validation
export default function parseProtocolHeaders(secHeader) {
  console.log(secHeader);
  const headers = secHeader.split(',');
  if (headers.length < 1) {
    throw new Error('WebSocket Auth headers are empty');
  }
  const protocol = headers[0];
  headers.shift();
  const extractedHeaders = new Map(
    headers.map((header) => {
      const [rawKey, rawValue] = header.split('.value.');
      const key = rawKey.replace('base64.header.', '').trim();
      // Restore padding and slash in base64 encoded value, because websocket browser api doesn't accept them
      const value = rawValue.replaceAll('-', '=').replaceAll('%', '/');
      return [key, value];
    }),
  );

  const clientKey = extractedHeaders.get('x-client-key-data');
  const clientCert = extractedHeaders.get('x-client-certificate-data');
  const ca = extractedHeaders.get('x-cluster-certificate-authority-data');
  const clusterURL = extractedHeaders.get('x-cluster-url');

  return {
    protocol,
    clientKey: Buffer.from(clientKey, 'base64').toString(),
    clientCert: Buffer.from(clientCert, 'base64').toString(),
    ca: Buffer.from(ca, 'base64').toString(),
    clusterURL: Buffer.from(clusterURL, 'base64').toString(),
  };
}
