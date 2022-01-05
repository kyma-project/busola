export function createContainerTemplate() {
  return {
    name: '',
    image: '',
    resources: createResourcesTemplate(),
  };
}

function createResourcesTemplate() {
  return {
    requests: {
      memory: '64Mi',
      cpu: '50m',
    },
    limits: {
      memory: '128Mi',
      cpu: '100m',
    },
  };
}

export function createDeploymentTemplate(namespaceId) {
  return {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata: {
      name: '',
      namespace: namespaceId,
      labels: {
        'app.kubernetes.io/name': '',
      },
    },
    spec: {
      replicas: 1,
      selector: {
        matchLabels: {
          app: '',
        },
      },
      template: {
        metadata: {
          labels: {
            app: '',
          },
        },
        spec: {
          imagePullSecrets: [],
          containers: [createContainerTemplate()],
        },
      },
    },
  };
}

export function createPresets(namespace, translate) {
  return [
    {
      name: translate('common.labels.default-preset'),
      value: {
        deployment: createDeploymentTemplate(namespace),
      },
    },
    {
      name: 'Echo server',
      value: {
        deployment: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          metadata: {
            name: 'echo-server',
            namespace,
            labels: {
              'app.kubernetes.io/name': 'echo-server',
            },
          },
          spec: {
            replicas: 1,
            selector: {
              matchLabels: {
                app: 'echo-server',
              },
            },
            template: {
              metadata: {
                labels: {
                  app: 'echo-server',
                },
              },
              spec: {
                containers: [
                  {
                    name: 'echo-server',
                    image: 'ealen/echo-server',
                    resources: createResourcesTemplate(),
                  },
                ],
              },
            },
          },
        },
        service: createServiceTemplate(namespace, 'echo-server', {
          port: 3000,
          targetPort: 80,
        }),
      },
    },
    {
      name: 'HTTPBin',
      value: {
        deployment: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          metadata: {
            name: 'httpbin',
            namespace,
            labels: {
              'app.kubernetes.io/name': 'httpbin',
            },
          },
          spec: {
            replicas: 1,
            selector: {
              matchLabels: {
                app: 'httpbin',
              },
            },
            template: {
              metadata: {
                labels: {
                  app: 'httpbin',
                },
              },
              spec: {
                containers: [
                  {
                    name: 'httpbin',
                    image: 'kennethreitz/httpbin',
                    resources: createResourcesTemplate(),
                  },
                ],
              },
            },
          },
        },
        service: createServiceTemplate(namespace, 'httpbin', {
          port: 80,
          targetPort: 80,
        }),
      },
    },
  ];
}

export function createServiceTemplate(namespace, name = '', port = {}) {
  return {
    apiVersion: '/v1',
    kind: 'Service',
    metadata: {
      name,
      namespace,
    },
    spec: {
      selector: { app: name },
      ports: [
        {
          protocol: 'TCP',
          port: 80,
          targetPort: 8080,
          ...port,
        },
      ],
    },
  };
}
