/* global Buffer */
import { InvalidInputError } from '../errors/errors';

export default function parseProtocolHeaders(secHeader) {
  const headers = secHeader.trim().split(',');
  if (headers.length < 2) {
    throw new InvalidInputError('WebSocket Auth headers are empty');
  }
  const protocol = headers[0];
  headers.shift();
  const extractedHeaders = new Map(
    headers.map((header) => {
      if (header === '') {
        throw new InvalidInputError('Malformed headers');
      }
      const [rawKey, rawValue] = header.split('.value.');
      if (rawKey === '' || rawValue === '') {
        throw new InvalidInputError(
          'Malformed header format for key: ' + rawKey,
        );
      }
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

  if (!ca) {
    throw new InvalidInputError('CA cert header is missing');
  }
  if (!clusterURL) {
    throw new InvalidInputError('Cluster URL header is missing');
  }

  return {
    protocol,
    clientKey: Buffer.from(clientKey ?? '', 'base64').toString(),
    clientCert: Buffer.from(clientCert ?? '', 'base64').toString(),
    ca: Buffer.from(ca, 'base64').toString(),
    clusterURL,
    token,
  };
}
