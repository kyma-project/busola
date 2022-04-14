export function createApiRuleTemplate(namespace) {
  return {
    apiVersion: 'gateway.kyma-project.io/v1alpha1',
    kind: 'APIRule',
    metadata: {
      name: '',
      namespace,
    },
    spec: {
      gateway: '',
      rules: [createRuleTemplate()],
      service: {
        host: '',
        name: '',
        port: '',
      },
    },
  };
}

export function createRuleTemplate() {
  return {
    accessStrategies: [createAccessStrategyTemplate()],
    methods: ['GET'],
    path: '/.*',
  };
}

export function createAccessStrategyTemplate() {
  return {
    handler: 'allow',
    config: {},
  };
}
