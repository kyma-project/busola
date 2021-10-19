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

export function createPresets(namespace, translate) {
  return [
    {
      name: translate('issuers.presets.default'),
      value: createIssuerTemplate(namespace),
    },
    {
      name: 'Lets Encrypt Stage',
      value: {
        apiVersion: 'cert.gardener.cloud/v1alpha1',
        kind: 'Issuer',
        metadata: {
          name: 'lets-encrypt-stage',
          namespace: namespace,
        },
        spec: {
          requestsPerDayQuota: 0,
          acme: {
            server: 'https://acme-staging-v02.api.letsencrypt.org/directory',
            email: '',
            autoRegistration: true,
          },
        },
      },
    },
    {
      name: 'Lets Encrypt Production',
      value: {
        apiVersion: 'cert.gardener.cloud/v1alpha1',
        kind: 'Issuer',
        metadata: {
          name: 'lets-encrypt-prod',
          namespace: namespace,
        },
        spec: {
          requestsPerDayQuota: 0,
          acme: {
            server: 'https://acme-v02.api.letsencrypt.org/directory',
            email: '',
            autoRegistration: true,
          },
        },
      },
    },
  ];
}
