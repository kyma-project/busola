import { mockGetRequest } from 'mocks/createMock';

export const clusterDetailsRuntimeInfo = mockGetRequest(
  '/backend/api/v1/namespaces/kyma-system/services/monitoring-prometheus:http-web/proxy/api/v1/status/runtimeinfo',
  {
    status: 'success',
    data: {
      startTime: '2022-06-02T03:06:36.306318469Z',
      CWD: '/prometheus',
      reloadConfigSuccess: true,
      lastConfigTime: '2022-06-02T03:06:54Z',
      corruptionCount: 0,
      goroutineCount: 358,
      GOMAXPROCS: 8,
      GOGC: '',
      GODEBUG: '',
      storageRetention: '1d or 2GiB',
    },
  },
);
