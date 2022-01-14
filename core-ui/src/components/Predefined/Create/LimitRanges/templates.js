export function createLimitRangeTemplate({
  max = '1100Mi',
  defaultVal = '511Mi',
  defaultRequest = '32Mi',
  name = '',
  namespaceName = '',
}) {
  return {
    apiVersion: 'v1',
    kind: 'LimitRange',
    metadata: {
      name,
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
