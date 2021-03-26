import { service1 } from 'testing/servicesMocks';
import { DEFAULT_GATEWAY } from '../ApiRuleForm';

export const apiRuleName = 'test-123';
export const mockNamespace = 'test';
export const hostname = 'host-1.2.3';

export const apiRule = () => ({
  name: 'tets',
  spec: {
    service: {
      name: service1.name,
      host: 'tets.kyma.cluster.com',
      port: service1.ports[0].port,
    },
    gateway: DEFAULT_GATEWAY,
    rules: [
      {
        path: '/aaa',
        methods: ['GET', 'PUT'],
        accessStrategies: [
          {
            handler: 'noop',
          },
        ],
      },
      {
        path: '/bbb',
        methods: [],
        accessStrategies: [
          {
            handler: 'allow',
          },
        ],
      },
    ],
  },
});
