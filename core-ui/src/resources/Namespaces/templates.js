export function createNamespaceTemplate() {
  return {
    kind: 'Namespace',
    apiVersion: 'v1',
    metadata: {
      name: '',
      labels: {},
      annotations: {},
    },
  };
}
