import { useCallback, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Terminal } from '@xterm/xterm';
import { authDataAtom, AuthDataState } from 'state/authDataAtom';
import { clusterAtom } from 'state/clusterAtom';
import { useFetch, FetchFn } from 'shared/hooks/BackendAPI/useFetch';
import { HttpError } from 'shared/hooks/BackendAPI/config';
import { getClusterConfig } from 'state/utils/getBackendInfo';
import { useFeature } from 'hooks/useFeature';
import { configFeaturesNames } from 'state/types';
import {
  terminalSessionAtom,
  TerminalSessionState,
} from 'state/terminalSessionAtom';

const TERMINAL_NAMESPACE = 'busola-terminal';
const CONTAINER_NAME = 'dev-toolbox';
const DEFAULT_IMAGE =
  'europe-docker.pkg.dev/kyma-project/prod/dev-toolbox:main';
const POD_TTL_MS = 60 * 60 * 1000;
const POD_POLL_INTERVAL_MS = 2000;
const POD_POLL_TIMEOUT_MS = 120_000;
const ATTACH_SUBPROTOCOL = 'v4.channel.k8s.io';

// Kubernetes attach stream channels — the first byte of every frame.
const STDIN_CHANNEL = 0;
const STDOUT_CHANNEL = 1;
const STDERR_CHANNEL = 2;

const ANSI_RESET = '\x1b[0m';
const ANSI_GREEN = '\x1b[32m';
const ANSI_YELLOW = '\x1b[33m';
const ANSI_RED = '\x1b[31m';

// \r returns the cursor to column 0 — xterm is in raw mode, so a lone \n staircases.
function terminalMessage(color: string, text: string) {
  return `\r\n${color}${text}${ANSI_RESET}\r\n`;
}

function getCredential(authData: AuthDataState): string {
  if (!authData) return '';
  if ('token' in authData) return authData.token;
  return authData['client-certificate-data'] ?? '';
}

export async function generateTerminalPodName(
  clusterServer: string,
  credential: string,
): Promise<string> {
  const raw = `${clusterServer}::${credential}`;
  const encoded = new TextEncoder().encode(raw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return `busola-terminal-${hex.slice(0, 8)}`;
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
        { image, name: CONTAINER_NAME, resources: {}, stdin: true, tty: true },
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
): Promise<void> {
  try {
    await fetchFn({
      relativeUrl,
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
  signal: AbortSignal,
): Promise<void> {
  const deadline = Date.now() + POD_POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
    const res = await fetchFn({
      relativeUrl: `/api/v1/namespaces/${TERMINAL_NAMESPACE}/pods/${podName}`,
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
  signal,
}: {
  fetchFn: FetchFn;
  podName: string;
  image: string;
  signal: AbortSignal;
}): Promise<void> {
  await createIfMissing(fetchFn, '/api/v1/namespaces', {
    apiVersion: 'v1',
    kind: 'Namespace',
    metadata: { name: TERMINAL_NAMESPACE },
  });
  await createIfMissing(
    fetchFn,
    `/api/v1/namespaces/${TERMINAL_NAMESPACE}/pods`,
    buildPodManifest(podName, image),
  );
  await pollPodReady(fetchFn, podName, signal);
}

function buildAttachUrl(podName: string, wsToken: string): string {
  const { protocol, host } = window.location;
  const wsProtocol = protocol === 'https:' ? 'wss:' : 'ws:';
  const { backendAddress } = getClusterConfig();
  const attachPath = `/api/v1/namespaces/${TERMINAL_NAMESPACE}/pods/${podName}/attach`;
  const params = new URLSearchParams({
    container: CONTAINER_NAME,
    stdin: 'true',
    stdout: 'true',
    stderr: 'true',
    tty: 'true',
    wsToken,
  });
  return `${wsProtocol}//${host}${backendAddress}/ws${attachPath}?${params}`;
}

// WebSocket handshakes can't carry headers, so credentials are first swapped
// for a short-lived token the backend (#4920) replays on the attach upgrade.
export async function attachToPod({
  fetchFn,
  term,
  podName,
  setSession,
  signal,
}: {
  fetchFn: FetchFn;
  term: Terminal;
  podName: string;
  setSession: (
    update: (prev: TerminalSessionState) => TerminalSessionState,
  ) => void;
  signal: AbortSignal;
}): Promise<{ ws: WebSocket; disposable: { dispose: () => void } }> {
  const tokenRes = await fetchFn({
    relativeUrl: '/ws-token',
    init: { method: 'POST' },
  });
  const { token: wsToken } = await tokenRes.json();

  const ws = new WebSocket(buildAttachUrl(podName, wsToken), [
    ATTACH_SUBPROTOCOL,
  ]);
  ws.binaryType = 'arraybuffer';

  ws.onopen = () => {
    if (signal.aborted) return;
    setSession((prev) => ({ ...prev, status: 'connected' }));
    term.write(terminalMessage(ANSI_GREEN, 'Connected to terminal.'));
  };

  ws.onmessage = (event) => {
    const data = new Uint8Array(event.data as ArrayBuffer);
    if (data[0] === STDOUT_CHANNEL || data[0] === STDERR_CHANNEL) {
      term.write(data.slice(1));
    }
  };

  ws.onclose = () => {
    if (signal.aborted) return;
    setSession((prev) => ({ ...prev, status: 'idle' }));
    term.write(terminalMessage(ANSI_YELLOW, 'Connection closed.'));
  };

  ws.onerror = () => {
    if (signal.aborted) return;
    setSession((prev) => ({
      ...prev,
      status: 'error',
      errorMessage: 'WebSocket connection error.',
    }));
  };

  const disposable = term.onData((input) => {
    if (ws.readyState !== WebSocket.OPEN) return;
    const bytes = new TextEncoder().encode(input);
    const frame = new Uint8Array(bytes.length + 1);
    frame[0] = STDIN_CHANNEL;
    frame.set(bytes, 1);
    ws.send(frame);
  });

  return { ws, disposable };
}

export function useTerminalSession() {
  const authData = useAtomValue(authDataAtom);
  const cluster = useAtomValue(clusterAtom);
  const fetchFn = useFetch();
  const setSession = useSetAtom(terminalSessionAtom);
  const { config } = useFeature(configFeaturesNames.TERMINAL);
  const image: string = config?.image ?? DEFAULT_IMAGE;

  const wsRef = useRef<WebSocket | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const onDataDisposableRef = useRef<{ dispose: () => void } | null>(null);

  const connect = useCallback(
    async (term: Terminal) => {
      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;

      const clusterServer =
        cluster?.currentContext?.cluster?.cluster?.server ?? '';
      const credential = getCredential(authData);

      setSession((prev) => ({
        ...prev,
        status: 'provisioning',
        errorMessage: null,
      }));

      try {
        const podName = await generateTerminalPodName(
          clusterServer,
          credential,
        );
        setSession((prev) => ({ ...prev, podName }));

        await provisionPod({ fetchFn, podName, image, signal: abort.signal });

        onDataDisposableRef.current?.dispose();
        const { ws, disposable } = await attachToPod({
          fetchFn,
          term,
          podName,
          setSession,
          signal: abort.signal,
        });
        wsRef.current = ws;
        onDataDisposableRef.current = disposable;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        setSession((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: err?.message ?? 'Unknown error.',
        }));
        term.write(
          terminalMessage(
            ANSI_RED,
            `Error: ${err?.message ?? 'Failed to connect.'}`,
          ),
        );
      }
    },
    [authData, cluster, fetchFn, image, setSession],
  );

  const disconnect = useCallback(
    async (podName: string | null) => {
      abortRef.current?.abort();
      onDataDisposableRef.current?.dispose();
      onDataDisposableRef.current = null;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
      wsRef.current = null;

      if (!podName) return;

      try {
        await fetchFn({
          relativeUrl: `/api/v1/namespaces/${TERMINAL_NAMESPACE}/pods/${podName}`,
          init: { method: 'DELETE' },
        });
      } catch {
        // best-effort
      }

      setSession({ status: 'idle', podName: null, errorMessage: null });
    },
    [fetchFn, setSession],
  );

  return { connect, disconnect };
}
