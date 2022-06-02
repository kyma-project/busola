import { mockGetRequest } from 'mocks/createMock';

export const clusterDetailsQueryRange3 = mockGetRequest(
  '/backend/api/v1/namespaces/kyma-system/services/monitoring-prometheus:http-web/proxy/api/v1/query?query=1%20-%20sum(avg%20by%20(mode)%20(rate(node_cpu_seconds_total%7B%20mode%3D~%22idle%7Ciowait%7Csteal%22%2C%20%7D%5B150s%5D)))&time=1654158582',
  {
    status: 'success',
    data: {
      resultType: 'vector',
      result: [{ metric: {}, value: [1654158582, '0.058687500000000226'] }],
    },
  },
);
