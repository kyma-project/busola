export function createHPATemplate(namespace) {
  return {
    apiVersion: 'autoscaling/v2',
    kind: 'HorizontalPodAutoscaler',
    metadata: {
      name: '',
      namespace,
    },
    spec: {
      maxReplicas: 3,
      scaleTargetRef: {
        kind: 'Deployment',
        name: '',
      },
    },
  };
}
