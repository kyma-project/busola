export function createCronJobTemplate(namespace) {
  return {
    apiVersion: 'batch/v1beta1',
    kind: 'CronJob',
    metadata: {
      name: '',
      namespace,
    },
    spec: {
      schedule: '* */1 * * *',
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

export function createPresets(namespace, translate) {
  return [
    {
      name: translate('common.labels.default-preset'),
      value: {
        apiVersion: 'batch/v1beta1',
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
        },
        concurrencyPolicy: 'Allow',
      },
    },
  ];
}
