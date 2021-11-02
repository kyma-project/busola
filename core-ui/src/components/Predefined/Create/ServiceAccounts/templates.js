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
    automountServiceAccountToken: false,
  };
}
