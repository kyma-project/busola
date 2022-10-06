export function createJobTemplate(namespace, templateAnnotations) {
  return {
    apiVersion: 'batch/v1',
    kind: 'Job',
    metadata: {
      name: '',
      namespace,
    },
    spec: {
      template: {
        metadata: {
          annotations: templateAnnotations,
        },
        spec: {
          containers: [createContainerTemplate()],
          restartPolicy: 'OnFailure',
        },
      },
    },
  };
}

export function createCronJobTemplate(namespace) {
  return {
    apiVersion: 'batch/v1',
    kind: 'CronJob',
    metadata: {
      name: '',
      namespace,
    },
    spec: {
      schedule: '*/1 * * * *',
      jobTemplate: {
        spec: {
          template: {
            spec: {
              containers: [createContainerTemplate()],
              restartPolicy: 'OnFailure',
            },
          },
        },
      },
      concurrencyPolicy: 'Allow',
    },
  };
}

export function createContainerTemplate() {
  return {
    name: '',
    image: '',
    imagePullPolicy: 'IfNotPresent',
    command: [],
  };
}

export function createJobPresets(namespace) {
  return [
    {
      name: 'Hello',
      value: {
        apiVersion: 'batch/v1',
        kind: 'Job',
        metadata: {
          name: 'hello',
          namespace,
          labels: {
            'app.kubernetes.io/name': 'hello',
          },
        },
        spec: {
          template: {
            spec: {
              containers: [
                {
                  name: 'hello',
                  image: 'busybox',
                  imagePullPolicy: 'IfNotPresent',
                  command: [
                    '/bin/sh',
                    '-c',
                    'date; echo Hello from the Kubernetes cluster',
                  ],
                },
              ],
              restartPolicy: 'OnFailure',
            },
          },
        },
      },
    },
  ];
}

export function createCronJobPresets(namespace) {
  return [
    {
      name: 'Hello',
      value: {
        apiVersion: 'batch/v1',
        kind: 'CronJob',
        metadata: {
          name: 'hello',
          namespace,
          labels: {
            'app.kubernetes.io/name': 'hello',
          },
        },
        spec: {
          schedule: '*/1 * * * *',
          jobTemplate: {
            spec: {
              template: {
                spec: {
                  containers: [
                    {
                      name: 'hello',
                      image: 'busybox',
                      imagePullPolicy: 'IfNotPresent',
                      command: [
                        '/bin/sh',
                        '-c',
                        'date; echo Hello from the Kubernetes cluster',
                      ],
                    },
                  ],
                  restartPolicy: 'OnFailure',
                },
              },
            },
          },
          concurrencyPolicy: 'Allow',
        },
      },
    },
  ];
}
