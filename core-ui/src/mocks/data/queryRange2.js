import { mockGetRequest } from 'mocks/createMock';

export const clusterDetailsQueryRange2 = mockGetRequest(
  '/backend/api/v1/namespaces/kyma-system/services/monitoring-prometheus:http-web/proxy/api/v1/query_range?start=2022-06-02T08:28:43.476Z&end=2022-06-02T08:29:42.476Z&step=60&query=sum(node_namespace_pod_container:container_memory_working_set_bytes{cluster=%22%22,%20container!=%22%22})%20by%20(node)%20/%20sum(kube_node_status_capacity{cluster=%22%22,%20resource=%22memory%22})%20by%20(node)',
  {
    status: 'success',
    data: {
      resultType: 'matrix',
      result: [
        {
          metric: {
            node: 'shoot--hasselhoff--kmain-worker-dev-z1-66c66-bn2hk',
          },
          values: [[1654158523.476, '0.12113856818158043']],
        },
        {
          metric: {
            node: 'shoot--hasselhoff--kmain-worker-dev-z1-66c66-f582j',
          },
          values: [[1654158523.476, '0.13686478849049255']],
        },
        {
          metric: {
            node: 'shoot--hasselhoff--kmain-worker-dev-z1-66c66-q4j5d',
          },
          values: [[1654158523.476, '0.14219561579411763']],
        },
      ],
    },
  },
);
