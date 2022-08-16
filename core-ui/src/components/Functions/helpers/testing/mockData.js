export const functionMock = {
  metadata: {
    name: 'function-pico-bello',
    namespace: 'namespace',
  },
  spec: {
    env: [
      {
        name: 'FOO',
        value: 'bar',
        valueFrom: null,
      },
      {
        name: 'PICO',
        valueFrom: {
          secretKeyRef: {
            name: 'secret',
            key: 'KEY',
          },
        },
      },
    ],
  },
};

export const gitfunctionMock = {
  ...functionMock,
  name: 'function-pico-bello',
  namespace: 'namespace',
  UID: 'pico-bello-123',
  labels: {
    foo: 'bar',
    pico: 'bello',
  },
  source: 'repository-name',
  sourceType: 'git',
  reference: 'reference',
  baseDir: 'baseDir',
};

export const repositoryMock = {
  name: 'repository-pico-bello',
  namespace: 'namespace',
  spec: {
    url: 'https://example.git',
    auth: {
      type: 'basic',
      secretName: 'secret-name',
    },
  },
};

export const eventActivationMock = {
  name: 'eventActivation',
  displayName: 'Sample Event Activation',
  sourceId: 'mockApp',
  events: [
    {
      eventType: 'type',
      version: 'v1',
      description: 'Sample description',
      schema: {},
    },
    {
      eventType: 'type',
      version: 'v2',
      description: 'Sample description',
      schema: {},
    },
  ],
};

export const eventTriggerMock = {
  name: 'eventTrigger',
  namespace: 'namespace',
  spec: {
    broker: 'default',
    filter: {
      source: 'mockApp',
      eventtypeversion: 'v1',
      type: 'type',
    },
    port: 80,
    path: '/',
  },
  status: {
    reason: 'reason',
    status: 'status',
  },
};

export const configMapMock = {
  json: {
    data: {
      key: 'value',
    },
  },
};
