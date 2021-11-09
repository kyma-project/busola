import { supportedMethodsList } from 'components/ApiRules/accessStrategyTypes';

export const apiRuleName = 'test-123';
export const mockNamespace = 'test';
export const hostname = 'host-1.2.3';

export const createdAPIRule = {
  name: apiRuleName,
};

export const sampleAPIRule = {
  name: apiRuleName,
  namespace: mockNamespace,
  params: {
    service: {
      name: 'test',
      port: 80,
      host: `${hostname}.kyma.local`,
    },
    gateway: 'kyma-gateway.kyma-system.svc.cluster.local',
    rules: [
      {
        path: '/.*',
        methods: supportedMethodsList,
        accessStrategies: [
          {
            handler: 'allow',
            config: {},
          },
        ],
      },
    ],
  },
};
