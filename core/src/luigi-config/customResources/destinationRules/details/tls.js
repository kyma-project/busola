export const tls = prefix => ({
  source: `${prefix}tls`,
  name: 'TLS',
  visibility: '$exists($.data)',
  widget: 'Panel',
  children: [
    {
      source: '$parent.mode',
      name: 'Mode',
      visibility: '$exists($.data)',
      widget: 'Badge',
    },
    {
      source: '$parent.clientCertificate',
      name: 'Client Certificate',
      visibility: '$exists($.data)',
    },
    {
      source: '$parent.privateKey',
      name: 'Private Key',
      visibility: '$exists($.data)',
      type: 'number',
    },
    {
      source: '$parent.caCertificates',
      name: 'CA Certificates',
      visibility: '$exists($.data)',
    },

    {
      source: '$parent.credentialName',
      name: 'Credential Name',
      visibility: '$exists($.data)',
    },
    {
      source: '$parent.subjectAltNames',
      name: 'Subject Alt Names',
      visibility: '$exists($.data)',
      widget: 'Labels',
    },

    {
      source: '$parent.sni',
      name: 'SNI',
      visibility: '$exists($.data)',
    },
    {
      source: '$parent.insecureSkipVerify',
      name: 'Insecure Skip Verify',
      visibility: '$exists($.data)',
      widget: 'Badge',
    },
  ],
});
