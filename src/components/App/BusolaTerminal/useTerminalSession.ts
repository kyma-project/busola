import { useCallback, useRef } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { Terminal } from '@xterm/xterm';
import { authDataAtom, AuthDataState } from 'state/authDataAtom';
import { clusterAtom } from 'state/clusterAtom';
import { useFetch } from 'shared/hooks/BackendAPI/useFetch';
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

function getCredential(authData: AuthDataState): string {
  if (!authData) return '';
  if ('token' in authData) return authData.token;
  return authData['client-certificate-data'] ?? '';
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
        const { ws, disposable } = await connectTerminal({
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
            COLOR_ERROR,
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
