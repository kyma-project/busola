import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<800'],
  },
};

// eslint-disable-next-line no-undef
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3001';

export default function mainTest() {
  const headers = {
    'Content-Type': 'application/json',
    referer: 'http://localhost:8080/',
    'user-agent': 'k6-load-test',
    'x-cluster-url': 'test.cluster.com',
    'x-k8s-authorization': `Bearer token`,
  };

  const res = http.get(`${BASE_URL}/backend`, { headers });

  check(res, {
    'status is 200 or 400': (r) => [200, 400].includes(r.status),
    'responds quickly': (r) => r.timings.duration < 800,
  });

  sleep(1);
}
