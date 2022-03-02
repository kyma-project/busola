export function createLimitRangeTemplate({
  min = '32Mi',
  max = '1100Mi',
  defaultVal = '512Mi',
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
          min: {
            memory: min,
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
