export function createCustomResourceDefinitionsTemplate() {
  return {
    apiVersion: 'apiextensions.k8s.io/v1',
    kind: 'CustomResourceDefinition',
    metadata: {
      name: '',
    },
    spec: {
      group: '',
      scope: 'Namespaced',
      versions: [
        {
          name: '',
          served: true,
          storage: true,
          schema: {
            openAPIV3Schema: {
              type: {},
              properties: {
                spec: {
                  type: {},
                  properties: {
                    cronSpec: {
                      type: '',
                    },
                    image: {
                      type: '',
                    },
                    replicas: {
                      type: 1,
                    },
                  },
                },
              },
            },
          },
        },
      ],
      names: {
        plural: '',
        singular: '',
        kind: '',
        shortNames: [''],
      },
    },
  };
}
