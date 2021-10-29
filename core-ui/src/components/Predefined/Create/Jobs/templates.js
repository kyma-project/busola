export function createJobTemplate(namespace) {
  return {
    apiVersion: 'batch/v1',
    kind: 'Job',
    metadata: {
      name: '',
      namespace,
    },
    spec: {
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

export function createCronJobTemplate(namespace) {
  const jobTemplate = createJobTemplate(namespace);
  jobTemplate.apiVersion = 'batch/v1beta1';
  jobTemplate.kind = 'CronJob';
  jobTemplate.spec = { ...jobTemplate.spec, schedule: '*/1 * * * *' };
  return jobTemplate;
}

export function createContainerTemplate() {
  return {
    name: '',
    image: '',
    imagePullPolicy: 'IfNotPresent',
    command: [],
  };
}

export function createJobPresets(namespace, translate) {
  return [
    {
      name: translate('common.labels.default-preset'),
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

export function createCronJobPresets(namespace, translate) {
  const jobPresets = createJobPresets(namespace, translate);
  return jobPresets.map(preset => {
    preset.value.apiVersion = 'batch/v1beta1';
    preset.value.kind = 'CronJob';
    preset.value.spec = { ...preset.value.spec, schedule: '*/1 * * * *' };
    return preset;
  });
}
