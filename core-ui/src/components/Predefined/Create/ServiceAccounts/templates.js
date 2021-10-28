export function newSecret(namespace) {
  return {
    name: '',
    namespace,
  };
}

export function createServiceAccountTemplate(namespace) {
  return {
    apiVersion: 'v1',
    kind: 'ServiceAccount',
    metadata: {
      name: '',
      namespace,
    },
    secrets: [newSecret(namespace)],
    automountServiceAccountToken: false,
  };
}
