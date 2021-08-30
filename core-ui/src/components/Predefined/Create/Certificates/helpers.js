import * as jp from 'jsonpath';

export function toYaml(cert) {
  return {
    apiVersion: 'cert.gardener.cloud/v1alpha1',
    kind: 'Certificate',
    metadata: {
      name: cert.name,
      namespace: cert.namespace,
    },
    spec: {
      commonName: cert.commonName || undefined,
      csr: cert.csr || undefined,
      dnsNames: cert.dnsNames.length ? cert.dnsNames : undefined,
      // ensureRenewedAfter
      issuerRef: cert.issuerRefName
        ? {
            name: cert.issuerRefName,
            namespace: cert.issuerRefNamespace,
          }
        : undefined,
      renew: cert.renew || undefined,
      secreName: cert.secretName || undefined,
      secretRef: cert.secretRefName
        ? {
            name: cert.secretRefName,
            namespace: cert.secretRefNamespace,
          }
        : undefined,
    },
  };
}

export function fromYaml(yaml, prevIssuer) {
  return {
    name: jp.value(yaml, '$.metadata.name') || '',
    namespace: jp.value(yaml, '$.metadata.name') || '',
    commonName: jp.value(yaml, '$.spec.commonName') || '',
    csr: jp.value(yaml, '$.spec.csr') || '',
    dnsNames: jp.value(yaml, '$.spec.dnsNames') || [],
    // ensureRenewedAfter: '', // datetime/timestamp
    issuerRefName: jp.value(yaml, '$.spec.issuerRef.name') || '',
    issuerRefNamespace: jp.value(yaml, '$.spec.issuerRef.namespace') || '',
    renew: jp.value(yaml, '$.spec.renew') || false,
    secretName: jp.value(yaml, '$.spec.secretName') || '',
    secretRefName: jp.value(yaml, '$.spec.secretRef.name') || '',
    secretRefNamepace: jp.value(yaml, '$.spec.secretRef.namespace') || '',
  };
}

export function createTemplate(namespace) {
  return {
    withCSR: true,
    name: '',
    namespace,
    commonName: '',
    csr: '',
    dnsNames: [],
    // ensureRenewedAfter: '', // datetime/timestamp
    issuerName: '',
    issuerNamespace: '',
    renew: false,
    secretName: '',
    secretRefName: '',
    secretRefNamepace: '',
  };
}
