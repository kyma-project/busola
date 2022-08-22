export const tls = {
  path: 'tls',
  widget: 'FormGroup',
  children: [
    { path: 'mode' },
    { path: 'clientCertificate' },
    { path: 'privateKey' },
    { path: 'caCertificates' },
    { path: 'credentialName' },
    { path: 'subjectAltNames', widget: 'SimpleList' },
    { path: 'sni', name: 'SNI' },
    { path: 'insecureSkipVerify' },
  ],
};

const tlsGenericListSyntax = { ...tls };
tlsGenericListSyntax.path = '[].tls';
export { tlsGenericListSyntax };
