import React from 'react';
import { X509Certificate } from '@peculiar/x509';
import { CertificatePanel } from './CertificatePanel';
import { base64Decode } from 'shared/helpers';

function decodeCertificate(value) {
  try {
    const certificateString = base64Decode(value);
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
