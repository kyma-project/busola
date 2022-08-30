export const tls = prefix => ({
  source: prefix + 'tls',
  name: 'tls',
  visibility: '$exists($.data)',
  widget: 'Panel',
  children: [
    {
      source: '$parent.mode',
      name: 'mode',
      visibility: '$exists($.data)',
      widget: 'Badge',
    },
    {
      source: '$parent.clientCertificate',
      name: 'clientCertificate',
      visibility: '$exists($.data)',
    },
    {
      source: '$parent.privateKey',
      name: 'privateKey',
      visibility: '$exists($.data)',
      type: 'number',
    },
    {
      source: '$parent.caCertificates',
      name: 'caCertificates',
      visibility: '$exists($.data)',
    },

    {
      source: '$parent.credentialName',
      name: 'credentialName',
      visibility: '$exists($.data)',
    },
    {
      source: '$parent.subjectAltNames',
      name: 'subjectAltNames',
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
      name: 'insecureSkipVerify',
      visibility: '$exists($.data)',
      widget: 'Badge',
    },
  ],
});
