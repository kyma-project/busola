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
      issuerRef: cert.issuerRef.name ? cert.issuerRef : undefined,
      renew: cert.renew || undefined,
      secreName:
        !cert.existingSecret && cert.secretName ? cert.secretName : undefined,
      secretRef:
        cert.existingSecret && cert.secretRef.name ? cert.secretRef : undefined,
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
    issuerRef: {
      name: jp.value(yaml, '$.spec.issuerRef.name') || '',
      namespace: jp.value(yaml, '$.spec.issuerRef.namespace') || '',
    },
    renew: jp.value(yaml, '$.spec.renew') || false,
    existingSecret: !!jp.value(yaml, '$.spec.secretRef'),
    secretName: jp.value(yaml, '$.spec.secretName') || '',
    secretRef: {
      name: jp.value(yaml, '$.spec.secretRef.name') || '',
      namespace: jp.value(yaml, '$.spec.secretRef.namespace') || '',
    },
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
    issuerRef: {
      name: '',
      namespace: '',
    },
    renew: false,
    existingSecret: false,
    secretName: '',
    secretRef: {
      name: '',
      namespace: '',
    },
  };
}
