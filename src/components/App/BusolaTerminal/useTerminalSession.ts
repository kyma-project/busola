import { useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import { Terminal } from '@xterm/xterm';
import { authDataAtom } from 'state/authDataAtom';
import { clusterAtom } from 'state/clusterAtom';
import { ssoDataAtom } from 'state/ssoDataAtom';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
import { createHeaders } from 'shared/hooks/BackendAPI/createHeaders';
import { useFeature } from 'hooks/useFeature';
import { configFeaturesNames } from 'state/types';
import { terminalSessionAtom } from 'state/terminalSessionAtom';
import {
  generateTerminalPodName,
  provisionPod,
  TERMINAL_NAMESPACE,
} from './provisionPod';
import {
  COLOR_ERROR,
  COLOR_WARNING,
  connectTerminal,
  terminalMessage,
} from './connectTerminal';

const DEFAULT_IMAGE =
  'europe-docker.pkg.dev/kyma-project/prod/dev-toolbox:main';

export function useTerminalSession() {
  const { t } = useTranslation();
  const authData = useAtomValue(authDataAtom);
  const cluster = useAtomValue(clusterAtom);
  const ssoData = useAtomValue(ssoDataAtom);
  const fetchFn = useFetch();
  const setSession = useSetAtom(terminalSessionAtom);
  const { config } = useFeature(configFeaturesNames.TERMINAL);
  const image: string = config?.image ?? DEFAULT_IMAGE;

  const wsRef = useRef<WebSocket | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const onDataDisposableRef = useRef<{ dispose: () => void } | null>(null);
  // Prevents double pod DELETE — close button and unmount cleanup both call disconnect.
  const disconnectedRef = useRef(false);
  const reconnectTimer = useRef<number>(0);
  const attemptRef = useRef(0);

  const connect = useCallback(
    async (term: Terminal) => {
      disconnectedRef.current = false;
      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;

      const clusterServer =
        cluster?.currentContext?.cluster?.cluster?.server ?? '';

      setSession({ status: 'provisioning', podName: null, errorMessage: null });

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
          scheduleReconnect,
        });
        wsRef.current = ws;
        onDataDisposableRef.current = disposable;
        attemptRef.current = 0;
        clearTimeout(reconnectTimer.current);
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
          terminalMessage(
            COLOR_ERROR,
            t('terminal.status.error', { error: message }),
          ),
        );
      }
    },
    [authData, cluster, ssoData, fetchFn, image, setSession, t, attemptRef],
  );

  const scheduleReconnect = useCallback(
    (term: Terminal) => {
      const attempt = attemptRef.current;
      if (attempt >= 10) {
        term.write(
          terminalMessage(COLOR_ERROR, t('terminal.messages.reconnect-failed')),
        );
        setSession((prev) => ({ ...prev, status: 'idle' }));
        return;
      } // stop after 10 attempts

      const baseDelay = Math.min(1000 * 2 ** attempt, 30000);
      const jitter = Math.random() * 1000;
      const delay = baseDelay + jitter;

      term.write(
        terminalMessage(COLOR_WARNING, `Reconnecting in ${delay} [ms]`),
      );
      reconnectTimer.current = setTimeout(() => {
        attemptRef.current += 1;
        connect(term);
      }, delay);
    },
    [connect, t, setSession],
  );

  const disconnect = useCallback(
    async (podName: string | null) => {
      if (disconnectedRef.current) return;
      disconnectedRef.current = true;

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
    },
    [fetchFn],
  );

  return { connect, disconnect };
}
