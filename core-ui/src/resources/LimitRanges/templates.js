export function createLimitRangeTemplate({
  max = '1100Mi',
  min = '16Mi',
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
