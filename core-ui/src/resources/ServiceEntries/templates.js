export const createServiceEntryTemplate = namespace => {
  return {
    apiVersion: 'networking.istio.io/v1beta1',
    kind: 'ServiceEntry',
    metadata: {
      name: '',
      namespace,
    },
    spec: {
      hosts: [''],
      resolution: 'DNS',
    },
  };
};
