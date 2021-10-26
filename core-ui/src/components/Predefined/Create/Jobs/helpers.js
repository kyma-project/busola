export function createJobTemplate(namespace) {
  return {
    apiVersion: 'batch/v1',
    kind: 'Job',
    metadata: {
      name: '',
      namespace,
    },
  };
}
