export function createSubscriptionInput(
  name,
  namespace,
  ownerRef,
  sink,
  eventType,
) {
  return {
    apiVersion: 'eventing.kyma-project.io/v1alpha1',
    kind: 'Subscription',
    metadata: {
      name,
      namespace,
      ownerReferences: [ownerRef],
    },
    spec: {
      sink,
      filter: {
        filters: [
          {
            eventSource: { property: 'source', type: 'exact', value: '' },
            eventType: {
              property: 'type',
              type: 'exact',
              value: eventType,
            },
          },
        ],
      },
    },
  };
}
