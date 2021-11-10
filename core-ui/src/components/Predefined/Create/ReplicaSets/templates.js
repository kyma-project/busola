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

export function createReplicaSetTemplate(namespaceId) {
  return {
    apiVersion: 'apps/v1',
    kind: 'ReplicaSet',
    metadata: {
      name: '',
      namespace: namespaceId,
      labels: {
        'app.kubernetes.io/name': '',
      },
    },
    spec: {
      replicas: 1,
      minReadySeconds: 0,
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
