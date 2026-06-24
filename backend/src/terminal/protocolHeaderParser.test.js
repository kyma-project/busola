import parseProtocolHeaders from './protocolHeaderParser';

const ca = 'CACERT';
const caEncoded = Buffer.from(ca).toString('base64').replaceAll('=', '');

const clientCert = 'client-cert-data';
const clientCertEncoded = Buffer.from(clientCert)
  .toString('base64')
  .replaceAll('=', '');

const clusterURL = 'https://0.0.0.0:46595';
const clusterURLEncoded = Buffer.from(clusterURL)
  .toString('base64')
  .replaceAll('=', '');

const clientKey = 'client-key';
const clientKeyEncoded = Buffer.from(clientKey)
  .toString('base64')
  .replaceAll('=', '');

describe('Parse protocl headers with auth data', () => {
  it('All data is presed and mTLS is used', () => {
    //GIVEN
    const protocolHeader = `v4.channel.k8s.io, base64.header.x-client-certificate-data.value.${clientCertEncoded}, base64.header.x-cluster-url.value.${clusterURLEncoded}, base64.header.x-cluster-certificate-authority-data.value.${caEncoded}, base64.header.x-client-key-data.value.${clientKeyEncoded}`;

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
