import { RefObject, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue } from 'jotai';
import { Terminal } from '@xterm/xterm';
import { authDataAtom } from 'state/authDataAtom';
import { clusterAtom } from 'state/clusterAtom';
import { ssoDataAtom } from 'state/ssoDataAtom';
import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import { useFeature } from 'hooks/useFeature';
import { configFeaturesNames, TerminalFeature } from 'state/types';
import {
  terminalSessionAtom,
  TerminalSessionState,
} from 'state/terminalSessionAtom';
import {
  COLOR_ERROR,
  COLOR_WARNING,
  connectTerminal,
  terminalSystemMessage,
} from './connectTerminal';
import { TFunction } from 'i18next';

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
  const [sessionInfo, setSession] = useAtom(terminalSessionAtom);
  const { config } = useFeature<TerminalFeature>(configFeaturesNames.TERMINAL);

  const maxSessionDurationMs: number | undefined = config?.maxSessionDurationMs;

  const wsRef = useRef<WebSocket | null>(null);
  const onDataDisposableRef = useRef<{ dispose: () => void } | null>(null);
  // Prevents double teardown — close button and unmount cleanup both call disconnect.
  const disconnectedRef = useRef(false);
  // Latches the deprovision call per pod so an in-flight DELETE from a prior
  // disconnect can't be re-fired by a new connect→disconnect cycle.
  const deprovisioningRef = useRef(false);
  const reconnectTimer = useRef<NodeJS.Timeout>(undefined);
  const proactiveReconnectTimer = useRef<NodeJS.Timeout>(undefined);
  const attemptRef = useRef(0);

  const connectRef = useRef<
    (term: Terminal, silent?: boolean) => Promise<void>
  >(() => Promise.resolve());

  const connect = useCallback(
    async (term: Terminal, silent = false) => {
      disconnectedRef.current = false;
      deprovisioningRef.current = false;
      // TODO: the abortController now lives on the session atom and is owned by
      // TerminalFeature; a deliberate connect cycle no longer aborts the old one
      // here. Re-establish that once pod lifecycle ownership is consolidated.
      // A proactive cycle's old socket is still open; close it to avoid a
      // leak / double-attach (a reactive drop already closed it).
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
        wsRef.current = null;
      }
      console.log('Connecting', sessionInfo);
      clearTimeout(proactiveReconnectTimer.current);
      proactiveReconnectTimer.current = undefined;

      try {
        const headers = createHeaders(authData, cluster, ssoData);
        const authHeaders = new Headers(headers);

        onDataDisposableRef.current?.dispose();
        const { ws, disposable } = await connectTerminal({
          authHeaders,
          term,
          podName: sessionInfo.podName,
          command: sessionInfo.command,
          containerName: sessionInfo.container,
          connectionType: sessionInfo.connectionType,
          namespace: sessionInfo.namespace,
          setSession,
          signal: sessionInfo.abortController?.signal,
          t,
          silent,
          scheduleReconnect: (term: Terminal) => {
            // A real drop cancels the pending proactive cycle.
            clearTimeout(proactiveReconnectTimer.current);
            proactiveReconnectTimer.current = undefined;
            reconnect(
              attemptRef,
              term,
              t,
              setSession,
              reconnectTimer,
              connectRef.current,
            );
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
                connectRef.current(term, true);
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
        setSession((prev: TerminalSessionState) => ({
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
      maxSessionDurationMs,
      sessionInfo,
      setSession,
      t,
    ],
  );
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

  // Only the teardown fields are read here; depending on them (not the whole
  // sessionInfo) keeps disconnect's identity stable across status/errorMessage
  // flips, so BusolaTerminal's cluster effect doesn't re-subscribe each time.
  const { abortController, deprovisionPod } = sessionInfo;
  const disconnect = useCallback(async () => {
    if (disconnectedRef.current) return;
    disconnectedRef.current = true;
    abortController?.abort();
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
    if (!deprovisioningRef.current) {
      deprovisioningRef.current = true;
      await deprovisionPod();
    }
  }, [abortController, deprovisionPod]);

  return { connect, disconnect };
}
