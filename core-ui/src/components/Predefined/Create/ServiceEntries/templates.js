export const createServiceEntryTemplate = () => {
  return {
    apiVersion: 'networking.istio.io/v1alpha3',
    kind: 'ServiceEntry',
    metadata: {
      name: '',
    },
    spec: {
      hosts: [''],
      resolution: 'DNS',
    },
  };
};
