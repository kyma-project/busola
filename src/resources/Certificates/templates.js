export function createTemplate(namespace) {
  return {
    apiVersion: 'cert.gardener.cloud/v1alpha1',
    kind: 'Certificate',
    metadata: {
      name: '',
      namespace,
      labels: {},
    },
    spec: {},
  };
}
