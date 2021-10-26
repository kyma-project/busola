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
      successfulJobsHistoryLimit: 3,
      failedJobsHistoryLimit: 1,
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
        successfulJobsHistoryLimit: 3,
        failedJobsHistoryLimit: 1,
        concurrencyPolicy: 'Allow',
      },
    },
    {
      name: translate('cron-jobs.create-modal.presets.node-js'),
      value: {
        apiVersion: 'batch/v1beta1',
        kind: 'CronJob',
        metadata: {
          name: 'node-js',
          namespace,
        },
        spec: {
          schedule: '*/2 * * * *',
          jobTemplate: {
            spec: {
              template: {
                spec: {
                  containers: [
                    {
                      name: 'node-js',
                      image: 'node:14-alpine',
                      imagePullPolicy: 'IfNotPresent',
                      command: [
                        'node',
                        '-e',
                        'console.log(new Date().toString())',
                      ],
                    },
                  ],
                  restartPolicy: 'OnFailure',
                },
              },
            },
          },
        },
      },
    },
  ];
}
