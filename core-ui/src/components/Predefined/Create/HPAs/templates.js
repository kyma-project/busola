export function createHPATemplate(namespace) {
  return {
    apiVersion: 'autoscaling/v2beta2',
    kind: 'HorizontalPodAutoscaler',
    metadata: {
      name: '',
      namespace,
    },
    spec: {
      minReplicas: 1,
      maxReplicas: 3,
      scaleTargetRef: {
        apiVersion: 'apps/v1',
        kind: 'Deployment',
        name: '',
      },
      metrics: [
        {
          type: 'Resource',
          resource: {
            name: 'cpu',
            target: {
              type: 'Utilization',
              averageUtilization: 80,
            },
          },
        },
      ],
    },
  };
}
