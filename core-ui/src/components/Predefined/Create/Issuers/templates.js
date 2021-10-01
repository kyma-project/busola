import * as jp from 'jsonpath';

export function createIssuerTemplate(namespace) {
  return {
    apiVersion: 'cert.gardener.cloud/v1alpha1',
    kind: 'Issuer',
    metadata: {
      name: '',
      namespace: namespace,
    },
    spec: {
      requestsPerDayQuota: 0,
    },
  };
}
export function createCATypeTemplate() {
  return {
    ca: {
      privateKeySecretRef: {
        name: '',
        namespace: '',
      },
    },
  };
}
export function createACMETypeTemplate() {
  return {
    acme: {
      server: '',
      email: '',
      autoRegistration: true,
    },
  };
}

export function createExternalAccountBinding({ keySecretRef, keyId }) {
  let externalAccountBinding = {};
  if (keyId) {
    jp.value(externalAccountBinding, '$.keyID', keyId);
  }
  if (!keySecretRef?.name && !keySecretRef?.namespace) {
    return externalAccountBinding;
  }
  jp.value(externalAccountBinding, '$.keySecretRef', keySecretRef);
  return externalAccountBinding;
}
