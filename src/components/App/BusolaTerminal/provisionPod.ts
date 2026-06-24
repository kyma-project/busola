import { FetchFn } from 'shared/hooks/BackendAPI/useFetch';
import { HttpError } from 'shared/hooks/BackendAPI/config';

export const TERMINAL_NAMESPACE = 'busola-terminal';
export const CONTAINER_NAME = 'dev-toolbox';

const POD_TTL_MS = 60 * 60 * 1000;
const POD_POLL_INTERVAL_MS = 2000;
const POD_POLL_TIMEOUT_MS = 120_000;

export async function generateTerminalPodName(
  clusterServer: string,
  credential: string,
): Promise<string> {
  const raw = `${clusterServer}::${credential}`;
  const encoded = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `busola-terminal-${hex.slice(0, 16)}`;
}

function buildPodManifest(podName: string, image: string) {
  const ttl = new Date(Date.now() + POD_TTL_MS).toISOString();
  return {
    apiVersion: 'v1',
    kind: 'Pod',
    metadata: {
      name: podName,
      namespace: TERMINAL_NAMESPACE,
      labels: { run: 'busola-terminal' },
      annotations: { 'busola.io/time-to-live': ttl },
    },
    spec: {
      containers: [
        {
          image,
          name: CONTAINER_NAME,
          resources: {
            requests: { cpu: '100m', memory: '128Mi' },
            limits: { cpu: '500m', memory: '256Mi' },
          },
          stdin: true,
          tty: true,
        },
      ],
      restartPolicy: 'Never',
    },
  };
}

// 409 (already exists) is treated as success.
async function createIfMissing(
  fetchFn: FetchFn,
  relativeUrl: string,
  manifest: object,
  abortController: AbortController,
): Promise<void> {
  try {
    await fetchFn({
      relativeUrl,
      abortController,
      init: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(manifest),
      },
    });
  } catch (err) {
    if (!(err instanceof HttpError && err.code === 409)) throw err;
  }
}

async function pollPodReady(
  fetchFn: FetchFn,
  podName: string,
  abortController: AbortController,
): Promise<void> {
  const deadline = Date.now() + POD_POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (abortController.signal.aborted)
      throw new DOMException('Aborted', 'AbortError');
    const res = await fetchFn({
      relativeUrl: `/api/v1/namespaces/${TERMINAL_NAMESPACE}/pods/${podName}`,
      abortController,
    });
    const pod = await res.json();
    const phase = pod?.status?.phase;
    if (phase === 'Running') return;
    if (phase === 'Failed' || phase === 'Succeeded') {
      throw new Error(`Terminal pod entered phase: ${phase}`);
    }
    await new Promise((resolve) => setTimeout(resolve, POD_POLL_INTERVAL_MS));
  }
  throw new Error('Timed out waiting for terminal pod to become ready.');
}

export async function provisionPod({
  fetchFn,
  podName,
  image,
  abortController,
}: {
  fetchFn: FetchFn;
  podName: string;
  image: string;
  abortController: AbortController;
}): Promise<void> {
  await createIfMissing(
    fetchFn,
    '/api/v1/namespaces',
    {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: { name: TERMINAL_NAMESPACE },
    },
    abortController,
  );
  await createIfMissing(
    fetchFn,
    `/api/v1/namespaces/${TERMINAL_NAMESPACE}/pods`,
    buildPodManifest(podName, image),
    abortController,
  );
  await pollPodReady(fetchFn, podName, abortController);
}
