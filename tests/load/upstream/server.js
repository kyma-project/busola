import https from 'https';
import { getUpstreamCert } from '../src/certs.js';

/** Approximate target body sizes in bytes for each payload class. */
export const PAYLOAD_SIZES = {
  small: 2 * 1024,
  medium: 64 * 1024,
  large: 1024 * 1024,
};

function makePod(i) {
  return {
    kind: 'Pod',
    apiVersion: 'v1',
    metadata: {
      name: `pod-${i}`,
      namespace: 'default',
      uid: `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`,
      resourceVersion: `${1000 + i}`,
      creationTimestamp: '2026-11-17T00:00:00Z',
      labels: { app: 'load', instance: `${i}` },
    },
    spec: {
      containers: [
        { name: 'main', image: 'nginx:1.27', ports: [{ containerPort: 80 }] },
      ],
    },
    status: {
      phase: 'Running',
      podIP: `10.0.${Math.floor(i / 255)}.${i % 255}`,
      startTime: '2026-11-17T00:00:00Z',
    },
  };
}

/** List response padded to ~targetBytes by appending realistic pod items. */
function buildList(targetBytes) {
  const items = [];
  const obj = {
    kind: 'PodList',
    apiVersion: 'v1',
    metadata: { resourceVersion: '1' },
    items,
  };
  let i = 0;
  while (Buffer.byteLength(JSON.stringify(obj)) < targetBytes && i < 100000) {
    items.push(makePod(i++));
  }
  return obj;
}

/** Detail response padded to ~targetBytes via a single annotation blob. */
function buildDetail(targetBytes) {
  const pod = makePod(0);
  const base = Buffer.byteLength(JSON.stringify(pod));
  const padLen = Math.max(0, targetBytes - base - 80);
  pod.metadata.annotations = { 'busola.io/load-padding': 'x'.repeat(padLen) };
  return pod;
}

const LIST_RE = /^\/api\/v1\/namespaces\/[^/]+\/pods$/;
const DETAIL_RE = /^\/api\/v1\/namespaces\/[^/]+\/pods\/[^/]+$/;

/**
 * Start the controlled HTTPS Kubernetes-shaped upstream.
 * Resolves to { url, port, close() }.
 */
export function startUpstream({
  port = 0,
  payloadSize = 'medium',
  latencyMs = 0,
} = {}) {
  const target = PAYLOAD_SIZES[payloadSize] ?? PAYLOAD_SIZES.medium;
  const { cert, key } = getUpstreamCert();
  const listBody = JSON.stringify(buildList(target));
  const detailBody = JSON.stringify(buildDetail(target));

  const server = https.createServer({ cert, key }, (req, res) => {
    const url = req.url.split('?')[0];
    const route = () => {
      if (DETAIL_RE.test(url)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(detailBody);
        return;
      }
      if (LIST_RE.test(url)) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(listBody);
        return;
      }
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ kind: 'Status', status: 'Failure', code: 404 }));
    };
    if (latencyMs > 0) setTimeout(route, latencyMs);
    else route();
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => {
      const actualPort = server.address().port;
      resolve({
        url: `https://127.0.0.1:${actualPort}`,
        port: actualPort,
        close: () => new Promise((r) => server.close(r)),
      });
    });
  });
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const port = Number(process.env.PORT) || 8443;
  const payloadSize = process.env.PAYLOAD_SIZE || 'medium';
  const latencyMs = Number(process.env.LATENCY_MS) || 0;
  const handle = await startUpstream({ port, payloadSize, latencyMs });
  console.log(
    `upstream listening at ${handle.url} payload=${payloadSize} latencyMs=${latencyMs}`,
  );
}
