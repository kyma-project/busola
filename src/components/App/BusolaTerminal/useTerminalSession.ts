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
  connectToPod,
  terminalSystemMessage,
} from './connectToPod';
import { TFunction } from 'i18next';

const RECONNECTION_MIN_DELAY_MS = 1_000;
const RECONNECTION_MAX_DELAY_MS = 30_000;
// Headroom before the hard cap for the re-provision + re-attach to finish.
const PROACTIVE_RECONNECT_SAFETY_BUFFER_MS = 30_000;
const MAX_ATTEMPTS = 10;

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
  if (attempt >= MAX_ATTEMPTS) {
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
      t('terminal.messages.reconnecting', {
        delay: Math.round(delay / 1000),
        current: attempt,
        max: MAX_ATTEMPTS,
      }),
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
  const [sessionInfo, setSessionInfo] = useAtom(terminalSessionAtom);
  const { config } = useFeature<TerminalFeature>(configFeaturesNames.TERMINAL);

  const maxSessionDurationMs: number | undefined = config?.maxSessionDurationMs;

  const wsRef = useRef<WebSocket | null>(null);
  const onDataDisposableRef = useRef<{ dispose: () => void } | null>(null);
  const disconnectedRef = useRef(false);
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
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        wsRef.current.close();
        wsRef.current = null;
      }
      clearTimeout(proactiveReconnectTimer.current);
      proactiveReconnectTimer.current = undefined;

      try {
        const headers = createHeaders(authData, cluster, ssoData);
        const authHeaders = new Headers(headers);

        onDataDisposableRef.current?.dispose();
        const { ws, disposable } = await connectToPod({
          authHeaders,
          term,
          podName: sessionInfo.podName,
          command: sessionInfo.command,
          containerName: sessionInfo.container,
          connectionType: sessionInfo.connectionType,
          namespace: sessionInfo.namespace,
          setSession: setSessionInfo,
          signal: sessionInfo.abortController?.signal,
          t,
          silent,
          scheduleReconnect: (term: Terminal) => {
            clearTimeout(proactiveReconnectTimer.current);
            proactiveReconnectTimer.current = undefined;
            reconnect(
              attemptRef,
              term,
              t,
              setSessionInfo,
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
        setSessionInfo((prev: TerminalSessionState) => ({
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
      setSessionInfo,
      t,
    ],
  );
  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

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
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close();
    }
    wsRef.current = null;
    if (!deprovisioningRef.current) {
      deprovisioningRef.current = true;
      await deprovisionPod();
    }
    setSessionInfo((prev) => ({ ...prev, status: 'idle' }));
  }, [abortController, deprovisionPod]);

  return { connect, disconnect };
}
