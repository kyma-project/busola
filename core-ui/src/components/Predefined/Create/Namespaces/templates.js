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
  { limits, requests, namespaceName } = {
    limits: '3Gi',
    requests: '2.8Gi',
    namespaceName: '',
  },
) {
  return {
    apiVersion: 'v1',
    kind: 'ResourceQuota',
    metadata: {
      name: `${namespaceName}-quotas`,
      namespace: namespaceName,
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
  { max, defaultVal, defaultRequest, namespaceName } = {
    max: '1100Mi',
    defaultVal: '511Mi',
    defaultRequest: '32Mi',
    namespaceName: '',
  },
) {
  return {
    apiVersion: 'v1',
    kind: 'LimitRange',
    metadata: {
      name: `${namespaceName}-limits`,
      namespace: namespaceName,
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
