export function createServiceTemplate(namespace) {
  return {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: '',
      namespace,
    },
    spec: {
      selector: {
        app: '',
      },
      ports: [
        {
          protocol: '',
          port: 80,
          targetPort: 9376,
        },
      ],
    },
  };
}
