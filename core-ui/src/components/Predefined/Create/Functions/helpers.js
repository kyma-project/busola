export function createFunctionTemplate(namespace) {
  return {
    apiVersion: 'serverless.kyma-project.io/v1alpha1',
    kind: 'Function',
    metadata: {
      name: '',
      namespace,
      labels: {
        'app.kubernetes.io/name': '',
      },
    },
    spec: {
      runtime: 'nodejs14',
      type: '',
      minReplicas: 1,
      maxReplicas: 5,
    },
  };
}
