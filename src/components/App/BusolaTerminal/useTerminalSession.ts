import { useCallback, useRef } from 'react';
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
  connectTerminal,
  terminalMessage,
  COLOR_ERROR,
} from './connectTerminal';

const DEFAULT_IMAGE =
  'europe-docker.pkg.dev/kyma-project/prod/dev-toolbox:main';

export function useTerminalSession() {
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

  const connect = useCallback(
    async (term: Terminal) => {
      abortRef.current?.abort();
      const abort = new AbortController();
      abortRef.current = abort;

      const clusterServer =
        cluster?.currentContext?.cluster?.cluster?.server ?? '';

      setSession((prev) => ({
        ...prev,
        status: 'provisioning',
        errorMessage: null,
      }));

      try {
        const rawHeaders = createHeaders(authData, cluster, ssoData);
        const authHeaders = Object.fromEntries(
          Object.entries(
            rawHeaders as Record<string, string | undefined>,
          ).filter((entry): entry is [string, string] => entry[1] != null),
        );

        const credential =
          authHeaders['X-K8s-Authorization']?.replace('Bearer ', '') ??
          authHeaders['X-Client-Certificate-Data'] ??
          '';
        const podName = await generateTerminalPodName(
          clusterServer,
          credential,
        );
        setSession((prev) => ({ ...prev, podName }));

        await provisionPod({ fetchFn, podName, image, signal: abort.signal });

        onDataDisposableRef.current?.dispose();
        const { ws, disposable } = await connectTerminal({
          authHeaders,
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
            COLOR_ERROR,
            `Error: ${err?.message ?? 'Failed to connect.'}`,
          ),
        );
      }
    },
    [authData, cluster, ssoData, fetchFn, image, setSession],
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
