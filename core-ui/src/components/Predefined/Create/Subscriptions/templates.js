export function createTemplate(namespace, sink, eventTypeValue) {
  return {
    apiVersion: 'eventing.kyma-project.io/v1alpha1',
    kind: 'Subscription',
    metadata: {
      name: '',
      namespace: namespace,
      labels: {},
    },
    spec: {
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
              value: eventTypeValue,
            },
          },
        ],
      },
      sink,
    },
  };
}
