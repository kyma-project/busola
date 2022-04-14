import { DEFAULT_EVENT_TYPE_PREFIX } from './helpers';

export function createSubscriptionTemplate(namespace, serviceName) {
  return {
    apiVersion: 'eventing.kyma-project.io/v1alpha1',
    kind: 'Subscription',
    metadata: {
      name: '',
      namespace,
      labels: {},
    },
    spec: {
      sink: `http://${serviceName}.${namespace}.svc.cluster.local`,
      filter: {
        filters: [createFilterTemplate()],
      },
    },
  };
}

export const createFilterTemplate = () => ({
  eventSource: {
    property: 'source',
    type: 'exact',
    value: '',
  },
  eventType: {
    property: 'type',
    type: 'exact',
    value: DEFAULT_EVENT_TYPE_PREFIX,
  },
});
