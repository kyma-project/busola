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
    { path: 'sni' },
    { path: 'insecureSkipVerify' },
  ],
};
