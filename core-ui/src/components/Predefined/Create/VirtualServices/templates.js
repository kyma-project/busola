export function createTemplate(namespace) {
  return {
    apiVersion: 'networking.istio.io/v1beta1',
    kind: 'VirtualService',
    metadata: {
      name: '',
      namespace: namespace,
    },
    spec: {},
  };
}
