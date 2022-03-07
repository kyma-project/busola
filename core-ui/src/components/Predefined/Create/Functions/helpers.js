import { randomNameGenerator } from 'react-shared';

export function createFunctionTemplate(namespace) {
  const name = randomNameGenerator();
  return {
    apiVersion: 'serverless.kyma-project.io/v1alpha1',
    kind: 'Function',
    metadata: {
      name,
      namespace,
      labels: {
        'app.kubernetes.io/name': name,
      },
    },
    //
    spec: {
      runtime: 'nodejs14',
      type: '',
      minReplicas: 1,
      maxReplicas: 5,
      resources: {
        limits: { cpu: '200m', memory: '256Mi' },
        requests: { cpu: '100m', memory: '128Mi' },
      },
      buildResources: {
        limits: { cpu: '1700m', memory: '1100Mi' },
        requests: { cpu: '1100m', memory: '1100Mi' },
      },
    },
  };
}
