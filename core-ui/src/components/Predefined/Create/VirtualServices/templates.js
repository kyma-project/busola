export function createTemplate(namespace) {
  return {
    apiVersion: 'apps/v1',
    kind: 'DaemonSet',
    metadata: {
      name: '',
      namespace: namespace,
    },
    spec: {},
  };
}
