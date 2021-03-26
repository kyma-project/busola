import { service1, service2 } from 'testing/servicesMocks';
import { EXCLUDED_SERVICES_LABELS } from 'components/ApiRules/constants';

export const mockNamespace = 'test';
export const oldHostname = 'unsuitable-snake';
export const newHostname = 'different-hostname';

export const apiRule = {
  name: 'test-123',
  spec: {
    service: {
      host: `${oldHostname}.kyma.local`,
      name: 'test',
      port: 80,
    },
    gateway: 'kyma-gateway.kyma-system.svc.cluster.local',
    rules: [
      {
        path: '/.*',
        methods: ['PUT', 'POST', 'GET', 'DELETE'],
        accessStrategies: [
          {
            handler: 'noop',
            config: {},
          },
        ],
      },
    ],
  },
};
