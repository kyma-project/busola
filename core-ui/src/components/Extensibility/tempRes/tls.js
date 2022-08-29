export const tls = prefix => ({
  source: prefix + 'tls',
  name: 'tls',
  visibility: '$exists($.data)',
  widget: 'Panel',
  children: [
    {
      source: prefix + 'tls.mode',
      name: 'mode',
      visibility: '$exists($.data)',
      widget: 'Badge',
    },
    {
      source: prefix + 'tls.clientCertificate',
      name: 'clientCertificate',
      visibility: '$exists($.data)',
    },
    {
      source: prefix + 'tls.privateKey',
      name: 'privateKey',
      visibility: '$exists($.data)',
      type: 'number',
    },
    {
      source: prefix + 'tls.caCertificates',
      name: 'caCertificates',
      visibility: '$exists($.data)',
    },

    {
      source: prefix + 'tls.credentialName',
      name: 'credentialName',
      visibility: '$exists($.data)',
    },
    {
      source: prefix + 'tls.subjectAltNames',
      name: 'subjectAltNames',
      visibility: '$exists($.data)',
      widget: 'Labels',
    },

    {
      source: prefix + 'tls.sni',
      name: 'SNI',
      visibility: '$exists($.data)',
    },
    {
      source: prefix + 'tls.insecureSkipVerify',
      name: 'insecureSkipVerify',
      visibility: '$exists($.data)',
      widget: 'Badge',
    },
  ],
});
