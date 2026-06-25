import parseProtocolHeaders from './protocolHeaderParser';

function encodeBase64URL(input) {
  return Buffer.from(input).toString('base64url');
}

function encodeBase64(input) {
  return Buffer.from(input).toString('base64url');
}

const ca = 'CACERT';
const caEncoded = encodeBase64URL(encodeBase64(ca));

const clientCert = 'client-cert-data';
const clientCertEncoded = encodeBase64URL(encodeBase64(clientCert));

const clusterURL = 'https://0.0.0.0:46595';
const clusterURLEncoded = encodeBase64URL(clusterURL);

const clientKey = 'client-key';
const clientKeyEncoded = encodeBase64URL(encodeBase64(clientKey));

describe('Parse protocl headers with auth data', () => {
  it('All data is presed and mTLS is used', () => {
    //GIVEN
    const protocolHeader = `v4.channel.k8s.io, base64url.header.x-client-certificate-data.value.${clientCertEncoded}, base64url.header.x-cluster-url.value.${clusterURLEncoded}, base64url.header.x-cluster-certificate-authority-data.value.${caEncoded}, base64url.header.x-client-key-data.value.${clientKeyEncoded}`;

    //WHEN
    const output = parseProtocolHeaders(protocolHeader);

    console.log(output);
    //THEN
    expect(output.protocol).toEqual('v4.channel.k8s.io');
    expect(output.clientKey).toEqual(clientKey);
    expect(output.clientCert).toEqual(clientCert);
    expect(output.ca).toEqual(ca);
    expect(output.clusterURL).toEqual(clusterURL);
  });
});
