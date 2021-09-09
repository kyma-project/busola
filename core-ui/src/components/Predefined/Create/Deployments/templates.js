export function createContainerTemplate() {
  return {
    name: '',
    image: '',
    resources: {
      requests: {
        memory: '64Mi',
        cpu: '50m',
      },
      limits: {
        memory: '128Mi',
        cpu: '100m',
      },
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
      labels: {},
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
          containers: [createContainerTemplate()],
        },
      },
    },
  };
}

export function createPresets(namespace, translate) {
  return [
    {
      name: translate('deployments.create-modal.presets.default'),
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
            labels: {},
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
                    resources: {
                      requests: {
                        memory: '64Mi',
                        cpu: '50m',
                      },
                      limits: {
                        memory: '128Mi',
                        cpu: '100m',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        service: createServiceTemplate(namespace),
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
            labels: {},
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
                    resources: {
                      requests: {
                        memory: '64Mi',
                        cpu: '50m',
                      },
                      limits: {
                        memory: '128Mi',
                        cpu: '100m',
                      },
                    },
                  },
                ],
              },
            },
          },
        },
        service: createServiceTemplate(namespace),
      },
    },
  ];
}

export function createServiceTemplate(namespace) {
  return {
    apiVersion: 'v1',
    kind: 'Service',
    metadata: {
      name: '',
      namespace,
    },
    spec: {
      selector: {},
      ports: [
        {
          protocol: 'TCP',
          port: 8080,
          targetPort: 80,
        },
      ],
    },
  };
}
