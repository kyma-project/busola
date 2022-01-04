export function createSubscriptionTemplate(
  namespace,
  eventTypePrefix,
  serviceName,
) {
  return {
    apiVersion: 'eventing.kyma-project.io/v1alpha1',
    kind: 'Subscription',
    metadata: {
      name: '',
      namespace,
      labels: {},
    },
    spec: {
      sink: `https://${serviceName}.${namespace}.svc.cluster.local`,
      filter: {
        filters: [
          {
            eventSource: {
              property: 'source',
              type: 'exact',
              value: '',
            },
            eventType: {
              property: 'type',
              type: 'exact',
              value: eventTypePrefix,
            },
          },
        ],
      },
    },
  };
}
