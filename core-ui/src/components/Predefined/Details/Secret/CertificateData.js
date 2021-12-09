import React from 'react';
import { X509Certificate } from '@peculiar/x509';
import { CertificatePanel } from './CertificatePanel';

function decodeCertificate(value) {
  try {
    const certificateString = Buffer.from(value, 'base64').toString('ascii');
    return new X509Certificate(certificateString);
  } catch (_) {
    return null;
  }
}

export function CertificateData(secret) {
  if (secret.type !== 'kubernetes.io/tls') {
    return null;
  }

  return Object.entries(secret.data).map(([key, value]) => {
    const certificate = decodeCertificate(value);
    if (!certificate) {
      return null;
    }

    return <CertificatePanel key={key} name={key} certificate={certificate} />;
  });
}
