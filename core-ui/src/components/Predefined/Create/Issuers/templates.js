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
    // privateKeySecretRef:{
    //   name: '',
    //   namespace: '',
    // }
  };
}
