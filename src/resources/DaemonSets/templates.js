export function createDaemonSetTemplate(namespace, appName = 'app1') {
  return {
    apiVersion: 'apps/v1',
    kind: 'DaemonSet',
    metadata: {
      name: '',
      namespace: namespace,
    },
    spec: {
      selector: {
        matchLabels: {
          name: appName,
        },
      },
      template: {
        metadata: {
          labels: {
            name: appName,
          },
        },
        spec: {
          containers: [
            {
              name: appName,
              image: '',
            },
          ],
        },
      },
    },
  };
}
