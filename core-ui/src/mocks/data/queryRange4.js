import { mockGetRequest } from 'mocks/createMock';

export const clusterDetailsQueryRange4 = mockGetRequest(
  '/backend/api/v1/namespaces/kyma-system/services/monitoring-prometheus:http-web/proxy/api/v1/query?query=sum(namespace_cpu%3Akube_pod_container_resource_limits%3Asum%7B%7D)%20%2F%20sum(kube_node_status_allocatable%7Bjob%3D%22kube-state-metrics%22%2Cresource%3D%22cpu%22%7D)&time=1654158582',
  {
    status: 'success',
    data: {
      resultType: 'vector',
      result: [{ metric: {}, value: [1654158582, '1.730345117845118'] }],
    },
  },
);
