export function createIngressTemplate(namespace: string) {
  return {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'Ingress',
    metadata: {
      name: '',
      namespace,
    },
    spec: {
      defaultBackend: {
        resource: {
          apiGroup: 'core',
          kind: 'Service',
          name: 'web',
        },
      },
    },
  };
}
