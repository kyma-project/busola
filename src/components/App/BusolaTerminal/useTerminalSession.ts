import { useCallback, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Terminal } from '@xterm/xterm';
import { authDataAtom } from 'state/authDataAtom';
import { clusterAtom } from 'state/clusterAtom';
import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import {
  terminalSessionAtom,
  TerminalSessionState,
} from 'state/terminalSessionAtom';

const TERMINAL_NAMESPACE = 'busola-terminal';
const DEV_TOOLBOX_IMAGE =
  'europe-docker.pkg.dev/kyma-project/prod/dev-toolbox:main';
const POD_POLL_INTERVAL_MS = 2000;
const POD_POLL_TIMEOUT_MS = 120_000;

export async function deriveTerminalPodName(
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

function buildNamespaceManifest() {
  return {
    apiVersion: 'v1',
    kind: 'Namespace',
    metadata: { name: TERMINAL_NAMESPACE },
  };
}

function buildPodManifest(podName: string) {
  const ttl = new Date(Date.now() + 60 * 60 * 1000).toISOString();
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
          image: DEV_TOOLBOX_IMAGE,
          name: 'dev-toolbox',
          resources: {},
          stdin: true,
          tty: true,
        },
      ],
      restartPolicy: 'Never',
    },
  };
}

async function pollPodReady(
  fetchFn: ReturnType<typeof useFetch>,
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
    if (pod?.status?.phase === 'Running') return;
    await new Promise((resolve) => setTimeout(resolve, POD_POLL_INTERVAL_MS));
  }
  throw new Error('Timed out waiting for terminal pod to become ready.');
}

export function useTerminalSession() {
  const authData = useAtomValue(authDataAtom);
  const cluster = useAtomValue(clusterAtom);
  const fetchFn = useFetch();
  const setSession = useSetAtom(terminalSessionAtom);
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
      const credential =
        ('token' in (authData ?? {}) ? (authData as any).token : null) ??
        (authData as any)?.['client-certificate-data'] ??
        '';

      setSession((prev: TerminalSessionState) => ({
        ...prev,
        status: 'provisioning',
        errorMessage: null,
      }));

      try {
        try {
          await fetchFn({
            relativeUrl: '/api/v1/namespaces',
            init: {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(buildNamespaceManifest()),
            },
          });
        } catch (err: any) {
          if (err?.code !== 409 && err?.status !== 409) throw err;
        }

        const podName = await deriveTerminalPodName(clusterServer, credential);
        setSession((prev: TerminalSessionState) => ({ ...prev, podName }));

        try {
          await fetchFn({
            relativeUrl: `/api/v1/namespaces/${TERMINAL_NAMESPACE}/pods`,
            init: {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(buildPodManifest(podName)),
            },
          });
        } catch (err: any) {
          if (err?.code !== 409 && err?.status !== 409) throw err;
        }

        await pollPodReady(fetchFn, podName, abort.signal);

        // --- Backend contract (implemented in #4920) -------------------------
        // Browsers cannot set custom headers on a WebSocket handshake, so cluster
        // credentials are exchanged out-of-band:
        //   1. POST /backend/ws-token  body: createHeaders(authData, cluster)
        //        -> { token }  (short-lived, single-use)
        //   2. WS /backend/ws<k8s-attach-path>?...&wsToken=<token>
        //        subprotocol: v4.channel.k8s.io
        //        The backend resolves the token to the stored credentials and
        //        proxies the socket to the cluster's pod/attach endpoint.
        // Until #4920 lands these calls fail at step 1; full e2e is verified in #4923.
        // ---------------------------------------------------------------------
        const credHeaders = createHeaders(authData, cluster);
        const tokenRes = await fetch('/backend/ws-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credHeaders),
        });
        if (!tokenRes.ok) throw new Error('Failed to obtain ws-token.');
        const { token: wsToken } = await tokenRes.json();

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const attachPath = `/api/v1/namespaces/${TERMINAL_NAMESPACE}/pods/${podName}/attach`;
        const attachParams = new URLSearchParams({
          container: 'dev-toolbox',
          stdin: 'true',
          stdout: 'true',
          stderr: 'true',
          tty: 'true',
          wsToken,
        });
        const wsUrl = `${protocol}//${window.location.host}/backend/ws${attachPath}?${attachParams}`;
        const ws = new WebSocket(wsUrl, ['v4.channel.k8s.io']);
        wsRef.current = ws;
        ws.binaryType = 'arraybuffer';

        ws.onopen = () => {
          setSession((prev: TerminalSessionState) => ({
            ...prev,
            status: 'connected',
          }));
          term.write('\r\n\x1b[32mConnected to terminal.\x1b[0m\r\n');
        };

        ws.onmessage = (event) => {
          // First byte is the Kubernetes channel number (1=stdout, 2=stderr).
          const data =
            event.data instanceof ArrayBuffer
              ? new Uint8Array(event.data)
              : new TextEncoder().encode(event.data);
          if (data.length > 1 && (data[0] === 1 || data[0] === 2)) {
            term.write(data.slice(1));
          }
        };

        ws.onclose = () => {
          if (wsRef.current !== ws) return;
          setSession((prev: TerminalSessionState) => ({
            ...prev,
            status: 'idle',
          }));
          term.write('\r\n\x1b[33mConnection closed.\x1b[0m\r\n');
        };

        ws.onerror = () => {
          if (wsRef.current !== ws) return;
          setSession((prev: TerminalSessionState) => ({
            ...prev,
            status: 'error',
            errorMessage: 'WebSocket connection error.',
          }));
        };

        onDataDisposableRef.current?.dispose();
        onDataDisposableRef.current = term.onData((data) => {
          if (ws.readyState === WebSocket.OPEN) {
            const bytes = new TextEncoder().encode(data);
            // First byte is the Kubernetes stdin channel number (0).
            const msg = new Uint8Array(bytes.length + 1);
            msg[0] = 0;
            msg.set(bytes, 1);
            ws.send(msg);
          }
        });
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        setSession((prev: TerminalSessionState) => ({
          ...prev,
          status: 'error',
          errorMessage: err?.message ?? 'Unknown error.',
        }));
        term.write(
          `\r\n\x1b[31mError: ${err?.message ?? 'Failed to connect.'}\x1b[0m\r\n`,
        );
      }
    },
    [authData, cluster, fetchFn, setSession],
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
