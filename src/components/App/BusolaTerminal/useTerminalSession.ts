import { RefObject, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import { Terminal } from '@xterm/xterm';
import { authDataAtom } from 'state/authDataAtom';
import { clusterAtom } from 'state/clusterAtom';
import { ssoDataAtom } from 'state/ssoDataAtom';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import { useFeature } from 'hooks/useFeature';
import { configFeaturesNames, TerminalFeature } from 'state/types';
import {
  terminalSessionAtom,
  TerminalSessionState,
} from 'state/terminalSessionAtom';
import {
  generateTerminalPodName,
  provisionPod,
  TERMINAL_NAMESPACE,
} from './provisionPod';
import {
  COLOR_ERROR,
  COLOR_WARNING,
  connectTerminal,
  terminalSystemMessage,
} from './connectTerminal';
import { TFunction } from 'i18next';

const DEFAULT_IMAGE =
  'europe-docker.pkg.dev/kyma-project/prod/busola-dev-toolbox:latest';

const RECONNECTION_MIN_DELAY_MS = 1_000;
const RECONNECTION_MAX_DELAY_MS = 30_000;
// Headroom before the hard cap for the re-provision + re-attach to finish.
const PROACTIVE_RECONNECT_SAFETY_BUFFER_MS = 30_000;

const reconnect = (
  attemptRef: RefObject<number>,
  term: Terminal,
  t: TFunction,
  setSession: (
    update: (prev: TerminalSessionState) => TerminalSessionState,
  ) => void,
  reconnectTimer: RefObject<NodeJS.Timeout | undefined>,
  connect: (term: Terminal) => Promise<void>,
) => {
  const attempt = attemptRef.current;
  if (attempt >= 10) {
    term.write(
      terminalSystemMessage(
        COLOR_ERROR,
        t('terminal.messages.reconnect-failed'),
      ),
    );
    setSession((prev) => ({ ...prev, status: 'idle' }));
    return;
  }

  const baseDelay = Math.min(
    RECONNECTION_MIN_DELAY_MS * Math.pow(2, attempt),
    RECONNECTION_MAX_DELAY_MS,
  );
  const jitter = Math.random() * 1000;
  const delay = baseDelay + jitter;

  term.write(
    terminalSystemMessage(
      COLOR_WARNING,
      t('terminal.messages.reconnecting', { delay: Math.round(delay / 1000) }),
    ),
  );
  reconnectTimer.current = setTimeout(() => {
    attemptRef.current += 1;
    connect(term);
  }, delay);
};

export function useTerminalSession() {
  const { t } = useTranslation();
  const authData = useAtomValue(authDataAtom);
  const cluster = useAtomValue(clusterAtom);
  const ssoData = useAtomValue(ssoDataAtom);
  const fetchFn = useFetch();
  const setSession = useSetAtom(terminalSessionAtom);
  const { config } = useFeature<TerminalFeature>(configFeaturesNames.TERMINAL);
  const image: string = config?.image ?? DEFAULT_IMAGE;
  const maxSessionDurationMs: number | undefined = config?.maxSessionDurationMs;

  const wsRef = useRef<WebSocket | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const onDataDisposableRef = useRef<{ dispose: () => void } | null>(null);
  // Prevents double pod DELETE — close button and unmount cleanup both call disconnect.
  const disconnectedRef = useRef(false);
  const reconnectTimer = useRef<NodeJS.Timeout>(undefined);
  const proactiveReconnectTimer = useRef<NodeJS.Timeout>(undefined);
  const attemptRef = useRef(0);

  const connect = useCallback(
    async (term: Terminal, silent = false) => {
      disconnectedRef.current = false;
      // Abort first so connectTerminal's onclose guard skips the banner and
      // reactive reconnect on a deliberate cycle.
      abortRef.current?.abort();
      // A proactive cycle's old socket is still open; close it to avoid a
      // leak / double-attach (a reactive drop already closed it).
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
        wsRef.current = null;
      }
      clearTimeout(proactiveReconnectTimer.current);
      proactiveReconnectTimer.current = undefined;
      const abort = new AbortController();
      abortRef.current = abort;

      const clusterServer =
        cluster?.currentContext?.cluster?.cluster?.server ?? '';

      if (!silent) {
        setSession({
          status: 'provisioning',
          podName: null,
          errorMessage: null,
        });
      }

      try {
        const headers = createHeaders(authData, cluster, ssoData);
        const authHeaders = new Headers(headers);

        const credential =
          authHeaders.get('X-K8s-Authorization')?.replace('Bearer ', '') ??
          authHeaders.get('X-Client-Certificate-Data') ??
          '';
        const podName = await generateTerminalPodName(
          clusterServer,
          credential,
        );
        setSession((prev) => ({ ...prev, podName }));

        try {
          await provisionPod({
            fetchFn,
            podName,
            image,
            abortController: abort,
          });
        } catch (e) {
          // If the reconnection is not in active phase, throw hard error
          if (attemptRef.current === 0) {
            throw e;
          }
          console.warn(e);
        }

        // Bail if torn down during provisioning — the socket we'd open would leak.
        if (abort.signal.aborted) return;

        onDataDisposableRef.current?.dispose();
        const { ws, disposable } = await connectTerminal({
          authHeaders,
          term,
          podName,
          setSession,
          signal: abort.signal,
          t,
          silent,
          scheduleReconnect: (term: Terminal) => {
            // A real drop cancels the pending proactive cycle.
            clearTimeout(proactiveReconnectTimer.current);
            proactiveReconnectTimer.current = undefined;
            reconnect(attemptRef, term, t, setSession, reconnectTimer, connect);
          },
          onConnected: () => {
            attemptRef.current = 0;
            clearTimeout(reconnectTimer.current);
            reconnectTimer.current = undefined;
            clearTimeout(proactiveReconnectTimer.current);
            proactiveReconnectTimer.current = undefined;
            // Re-arm per connection; the cap is per-socket.
            if (
              maxSessionDurationMs &&
              maxSessionDurationMs > PROACTIVE_RECONNECT_SAFETY_BUFFER_MS
            ) {
              const delay =
                maxSessionDurationMs - PROACTIVE_RECONNECT_SAFETY_BUFFER_MS;
              proactiveReconnectTimer.current = setTimeout(() => {
                proactiveReconnectTimer.current = undefined;
                connect(term, true);
              }, delay);
            }
          },
        });
        wsRef.current = ws;
        onDataDisposableRef.current = disposable;
      } catch (err: any) {
        if (err?.name === 'AbortError') return;
        console.error(err);
        const message = err?.message ?? t('terminal.messages.unknown-error');
        setSession((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: message,
        }));
        term.write(
          terminalSystemMessage(COLOR_ERROR, t('terminal.status.error')),
        );
      }
    },
    [
      authData,
      cluster,
      ssoData,
      fetchFn,
      image,
      maxSessionDurationMs,
      setSession,
      t,
    ],
  );

  const disconnect = useCallback(
    async (podName: string | null) => {
      if (disconnectedRef.current) return;
      disconnectedRef.current = true;

      abortRef.current?.abort();
      // Cancel scheduled reconnects so they can't revive a torn-down terminal.
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = undefined;
      clearTimeout(proactiveReconnectTimer.current);
      proactiveReconnectTimer.current = undefined;
      attemptRef.current = 0;
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
    },
    [fetchFn],
  );

  return { connect, disconnect };
}
