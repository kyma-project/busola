export const formatNamespace = ({ name, labels }) => ({
  metadata: {
    name,
    labels,
  },
});

export const formatMemoryQuotas = ({ namespace, limits, requests }) => ({
  apiVersion: 'v1',
  kind: 'ResourceQuota',
  metadata: {
    name: `${namespace}-quotas`,
    namespace,
  },
  spec: {
    hard: {
      'limits.memory': limits,
      'requests.memory': requests,
    },
  },
});

export const formatLimits = ({
  namespace,
  max,
  default: _default,
  defaultRequest,
}) => ({
  apiVersion: 'v1',
  kind: 'LimitRange',
  metadata: {
    name: `${namespace}-limits`,
    namespace,
  },
  spec: {
    limits: [
      {
        type: 'Container',
        max: {
          memory: max,
        },
        default: {
          memory: _default,
        },
        defaultRequest: {
          memory: defaultRequest,
        },
      },
    ],
  },
});
