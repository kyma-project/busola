export function createEventSubscriptionTemplate(namespace) {
  return {
    apiVersion: 'eventing.kyma-project.io/v1alpha1',
    kind: 'Subscription',
    metadata: {
      name: '',
      namespace,
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
              value: '',
            },
          },
        ],
      },
      sink: '',
    },
  };
}
