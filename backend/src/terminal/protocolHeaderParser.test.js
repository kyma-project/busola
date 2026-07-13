import parseProtocolHeaders from './protocolHeaderParser';

function encodeBase64URL(input) {
  return Buffer.from(input).toString('base64url');
}

function encodeBase64(input) {
  return Buffer.from(input).toString('base64');
}

const ca = 'CACERT';
const caEncoded = encodeBase64URL(encodeBase64(ca));

const clientCert = 'client-cert-data';
const clientCertEncoded = encodeBase64URL(encodeBase64(clientCert));

const clusterURL = 'https://0.0.0.0:46595';
const clusterURLEncoded = encodeBase64URL(clusterURL);

const clientKey = 'client-key';
const clientKeyEncoded = encodeBase64URL(encodeBase64(clientKey));

const token = 'Bearer XYZ.ABC.LMN';
const tokenEncoded = encodeBase64URL(token);

describe('Parse protocol headers with auth data', () => {
  it('All data is present and mTLS is used', () => {
    //GIVEN
    const protocolHeader = `v4.channel.k8s.io, base64url.header.x-client-certificate-data.value.${clientCertEncoded}, base64url.header.x-cluster-url.value.${clusterURLEncoded}, base64url.header.x-cluster-certificate-authority-data.value.${caEncoded}, base64url.header.x-client-key-data.value.${clientKeyEncoded}`;

    //WHEN
    const output = parseProtocolHeaders(protocolHeader);

    //THEN
    expect(output.protocol).toEqual('v4.channel.k8s.io');
    expect(output.clientKey).toEqual(clientKey);
    expect(output.clientCert).toEqual(clientCert);
    expect(output.ca).toEqual(ca);
    expect(output.clusterURL).toEqual(clusterURL);
  });

  it('All data is present and token is used', () => {
    //GIVEN
    const protocolHeader = `v4.channel.k8s.io, base64url.header.x-k8s-authorization.value.${tokenEncoded}, base64url.header.x-cluster-url.value.${clusterURLEncoded}, base64url.header.x-cluster-certificate-authority-data.value.${caEncoded}`;

    //WHEN
    const output = parseProtocolHeaders(protocolHeader);

    //THEN
    expect(output.protocol).toEqual('v4.channel.k8s.io');
    expect(output.token).toEqual(token);
    expect(output.ca).toEqual(ca);
    expect(output.clusterURL).toEqual(clusterURL);
  });
});

describe('Throws error when required data is missing', () => {
  it('Headers doesn`t have CA header', () => {
    //GIVEN
    const protocolHeader = `v4.channel.k8s.io, base64url.header.x-cluster-url.value.${clusterURLEncoded}`;

    //WHEN
    expect(() => parseProtocolHeaders(protocolHeader)).toThrow(
      'CA cert header is missing',
    );
  });

  it('Headers doesn`t have X-Cluster-URL header', () => {
    //GIVEN
    const protocolHeader = `v4.channel.k8s.io, base64url.header.x-cluster-certificate-authority-data.value.${caEncoded}`;

    //WHEN
    expect(() => parseProtocolHeaders(protocolHeader)).toThrow(
      'Cluster URL header is missing',
    );
  });
});

describe('Throws error when parsing protocol invalid headers', () => {
  it('Only protocol is send', () => {
    //GIVEN
    const protocolHeader = `v4.channel.k8s.io,`;

    //WHEN
    expect(() => parseProtocolHeaders(protocolHeader)).toThrow(
      'Malformed headers',
    );
  });
  it('Only protocol is send', () => {
    //GIVEN
    const protocolHeader = `v4.channel.k8s.io`;

    //WHEN
    expect(() => parseProtocolHeaders(protocolHeader)).toThrow(
      'WebSocket Auth headers are empty',
    );
  });
  it('sec-websocket-protocol header is missing', () => {
    //GIVEN
    const protocolHeader = undefined;

    //WHEN
    expect(() => parseProtocolHeaders(protocolHeader)).toThrow(
      'Missing sec-websocket-protocol header',
    );
  });
  it('Auth header is malformed', () => {
    //GIVEN
    const protocolHeader = `v4.channel.k8s.io, base64url.header.x-client-certificate-data.value.`;

    //WHEN
    expect(() => parseProtocolHeaders(protocolHeader)).toThrow(
      'Malformed header format for key:  base64url.header.x-client-certificate-data',
    );
  });
});
