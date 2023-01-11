export function createStatefulSetTemplate(namespace, appName = 'app1') {
  return {
    apiVersion: 'apps/v1',
    kind: 'StatefulSet',
    metadata: {
      name: '',
      namespace,
    },
    spec: {
      selector: {
        matchLabels: {
          app: appName,
        },
      },
      serviceName: appName,
      template: {
        metadata: {
          labels: {
            app: appName,
          },
        },
      },
    },
  };
}
