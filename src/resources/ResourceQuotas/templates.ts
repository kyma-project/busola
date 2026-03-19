interface ResourceQuotaTemplateParams {
  limits?: { memory: string; cpu: string };
  requests?: { memory: string; cpu: string };
  name?: string;
  namespaceName?: string;
}

export function createResourceQuotaTemplate({
  limits = {
    memory: '3Gi',
    cpu: '4',
  },
  requests = {
    memory: '2.8Gi',
    cpu: '2',
  },
  name = '',
  namespaceName = '',
}: ResourceQuotaTemplateParams) {
  return {
    apiVersion: 'v1',
    kind: 'ResourceQuota',
    metadata: {
      name,
      namespace: namespaceName,
    },
    spec: {
      hard: {
        'limits.memory': limits.memory,
        'limits.cpu': limits.cpu,
        'requests.memory': requests.memory,
        'requests.cpu': requests.cpu,
      },
    },
  };
}
