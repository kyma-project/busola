import * as jp from 'jsonpath';

export function secretToYaml(secret) {
  return {
    apiVersion: 'v1',
    kind: 'Secret',
    type: secret.type,
    metadata: {
      name: secret.name,
      namespace: secret.namespace,
      labels: secret.labels,
      annotations: secret.annotations,
    },
    spec: {
      replicas: 1,
      selector: { matchLabels: secret.labels },
      template: {
        metadata: { labels: secret.labels },
        annotations: { annotations: secret.annotations },
        spec: {
          containers: [
            {
              name: secret.name,
              resources: {
                requests: secret.requests,
                limits: secret.limits,
              },
            },
          ],
        },
      },
    },
  };
}

export function yamlToSecret(yaml, prevSecret) {
  return {
    name: jp.value(yaml, '$.metadata.name') || '',
    namespace: jp.value(yaml, '$.metadata.namespace') || '',
    type: jp.value(yaml, '$.type') || '',
    labels: jp.value(yaml, '$.metadata.labels') || {},
  };
}

export function createSecretTemplate(namespaceId) {
  return {
    name: '',
    namespace: namespaceId,
    type: 'Opaque',
    labels: {},
    annotations: {},
  };
}

export function createPresets(namespaceId, translate) {
  return [
    {
      name: translate('secrets.create-modal.presets.default'),
      value: createSecretTemplate(namespaceId),
    },
    {
      name: 'Echo server',
      value: {
        name: 'echo-server',
        namespace: namespaceId,
        type: 'Opaque',
        labels: {},
        annotations: {},
      },
    },
  ];
}
