export const createSidecarTemplate = namespace => {
  return {
    apiVersion: 'networking.istio.io/v1beta1',
    kind: 'Sidecar',
    metadata: {
      name: '',
      namespace,
    },
    spec: {
      egress: [
        {
          hosts: [''],
        },
      ],
    },
  };
};
