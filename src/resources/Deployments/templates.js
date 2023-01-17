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
            'sidecar.istio.io/inject': 'false',
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
                  'sidecar.istio.io/inject': 'false',
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
                  'sidecar.istio.io/inject': 'false',
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
      },
    },
  ];
}
