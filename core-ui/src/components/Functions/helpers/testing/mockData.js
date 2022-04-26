import { base64Encode } from 'shared/helpers';

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

export const serviceBindingUsageMock = {
  serviceBinding: {
    metadata: {
      name: 'serviceBinding',
    },
    spec: {
      instanceRef: {
        name: 'serviceInstanceName',
      },
    },
  },
  serviceBindingUsage: {
    metadata: {
      name: 'serviceBindingUsage',
    },
    spec: {
      parameters: {
        envPrefix: {
          name: 'PREFIX_',
        },
      },
    },
  },
  secret: {
    metadata: {
      name: 'secret',
      namespace: 'namespace',
    },
    data: {
      FOO: base64Encode('foo'),
      BAR: base64Encode('bar'),
    },
  },
};

export const serviceInstanceMock = {
  name: 'serviceInstance',
  bindable: true,
  servicePlan: {
    bindingCreateParameterSchema: {},
  },
  serviceBindings: {
    items: [
      {
        name: 'serviceBinding',
        parameters: '',
        secret: {
          name: 'secret',
          data: {},
        },
      },
    ],
  },
};

export const configMapMock = {
  json: {
    data: {
      key: 'value',
    },
  },
};

export const serviceMock = {
  name: 'name',
};
