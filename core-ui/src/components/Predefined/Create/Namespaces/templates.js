export function createNamespaceTemplate() {
  return {
    metadata: {
      name: '',
      labels: {},
      annotations: {},
    },
  };
}

export function createMemoryQuotasTemplate(
  { limits, requests } = { limits: '3Gi', requests: '2.8Gi' },
) {
  return {
    apiVersion: 'v1',
    kind: 'ResourceQuota',
    metadata: {
      name: '', //format:  `${namespace}-initial-quotas`,
      namespace: '',
    },
    spec: {
      hard: {
        'limits.memory': limits,
        'requests.memory': requests,
      },
    },
  };
}

export function createLimitsTemplate(
  { max, defaultVal, defaultRequest } = {
    max: '1100Mi',
    defaultVal: '511Mi',
    defaultRequest: '32Mi',
  },
) {
  return {
    apiVersion: 'v1',
    kind: 'LimitRange',
    metadata: {
      name: '', //format: `${namespace}-initial-limits`,
      namespace: '',
    },
    spec: {
      limits: [
        {
          type: 'Container',
          max: {
            memory: max,
          },
          default: {
            memory: defaultVal,
          },
          defaultRequest: {
            memory: defaultRequest,
          },
        },
      ],
    },
  };
}
