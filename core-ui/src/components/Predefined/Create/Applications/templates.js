export function createApplicationTemplate() {
  return {
    apiVersion: 'applicationconnector.kyma-project.io/v1alpha1',
    kind: 'Application',
    metadata: {
      name: '',
      labels: {},
      annotations: {},
    },
    spec: {
      accessLabel: '',
      description: '',
      services: [],
    },
  };
}
