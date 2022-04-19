export function createDestinationRuleTemplate(namespace) {
  return {
    apiVersion: 'networking.istio.io/v1alpha3',
    kind: 'DestinationRule',
    metadata: {
      name: '',
      namespace,
    },
    spec: {
      host: 'ratings.prod.svc.cluster.local',
      trafficPolicy: {
        loadBalancer: {
          simple: 'LEAST_CONN',
        },
      },
    },
  };
}
