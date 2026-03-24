export type formatNamespaceProps = {
  name: string;
  labels: Record<string, string>;
};
export const formatNamespace = ({ name, labels }: formatNamespaceProps) => ({
  metadata: {
    name,
    labels,
  },
});

export type formatMemoryQuotasProps = {
  namespace: string;
  limits: any;
  requests: any;
};

export const formatMemoryQuotas = ({
  namespace,
  limits,
  requests,
}: formatMemoryQuotasProps) => ({
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

export type formatLimitsProps = {
  namespace: string;
  max: string;
  default: string;
  defaultRequest: string;
};

export const formatLimits = ({
  namespace,
  max,
  default: _default,
  defaultRequest,
}: formatLimitsProps) => ({
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
