export function createEmptyCronJobTemplate(namespace) {
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
      name: translate('cron-jobs.create-modal.presets.daily'),
      value: createCronJobTemplate(namespace, '0 0 * * *'),
    },
    {
      name: translate('cron-jobs.create-modal.presets.weekly'),
      value: createCronJobTemplate(namespace, '0 0 * * 1'),
    },
  ];
}

function createCronJobTemplate(namespace, schedule) {
  return {
    apiVersion: 'batch/v1beta1',
    kind: 'CronJob',
    metadata: {
      name: 'hello',
      namespace,
    },
    spec: {
      schedule,
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
  };
}
