export function createResourceQuotaTemplate({
  limits = '3Gi',
  requests = '2.8Gi',
  name = '',
  namespaceName = '',
}) {
  return {
    apiVersion: 'v1',
    kind: 'ResourceQuota',
    metadata: {
      name,
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
