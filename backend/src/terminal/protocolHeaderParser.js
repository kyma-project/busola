/* global Buffer */
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
      const key = rawKey.replace('base64url.header.', '').trim();
      const value = Buffer.from(rawValue ?? '', 'base64url').toString();
      return [key, value];
    }),
  );

  const clientKey = extractedHeaders.get('x-client-key-data');
  const clientCert = extractedHeaders.get('x-client-certificate-data');
  const ca = extractedHeaders.get('x-cluster-certificate-authority-data');
  const clusterURL = extractedHeaders.get('x-cluster-url');
  const token = extractedHeaders.get('x-k8s-authorization');

  return {
    protocol,
    clientKey: Buffer.from(clientKey ?? '', 'base64').toString(),
    clientCert: Buffer.from(clientCert ?? '', 'base64').toString(),
    ca: Buffer.from(ca, 'base64').toString(),
    clusterURL,
    token,
  };
}
