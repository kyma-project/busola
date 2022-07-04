export function createRepositoryTemplate(namespace) {
  return {
    apiVersion: 'serverless.kyma-project.io/v1alpha1',
    kind: 'GitRepository',
    metadata: {
      name: '',
      namespace,
      labels: {
        'app.kubernetes.io/name': '',
      },
    },
    spec: {},
  };
}
