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
      rules: [createAccessStrategyTemplate()],
      service: {
        host: '',
        name: '',
        port: '',
      },
      // host: 'aa.nkyma.kyma-prow.shoot.canary.k8s-hana.ondemand.com',
      // name: 'kubernetes',
      // port: 443,
    },
  };
}

export function createAccessStrategyTemplate() {
  return {
    accessStrategies: [
      {
        config: {},
        handler: 'allow',
      },
    ],
    methods: ['GET'],
    path: '/.*',
  };
}
