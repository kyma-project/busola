import { useCallback, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { useSetAtom } from 'jotai';
import { terminalSessionAtom } from 'state/terminalSessionAtom';
import { COLOR_ERROR, COLOR_WARNING, terminalMessage } from './connectTerminal';
import { Timeout } from 'node:timers';

export function useReconnect(
  connect: (term: Terminal) => Promise<void>,
  t: (key: string, options?: Record<string, unknown>) => string,
) {
  const setSession = useSetAtom(terminalSessionAtom);
  const reconnectTimer = useRef<Timeout | null>(null);
  const attemptRef = useRef(0);

  const scheduleReconnect = useCallback(
    (term: Terminal) => {
      const attempt = attemptRef.current;
      if (attempt >= 10) {
        term.write(
          terminalMessage(COLOR_ERROR, t('terminal.messages.reconnect-failed')),
        );
        setSession((prev) => ({ ...prev, status: 'idle' }));
        return;
      }

      const baseDelay = Math.min(1000 * 2 ** attempt, 30000);
      const jitter = Math.random() * 1000;
      const delay = baseDelay + jitter;

      term.write(
        terminalMessage(
          COLOR_WARNING,
          t('terminal.messages.reconnecting', { delay }),
        ),
      );
      reconnectTimer.current = setTimeout(() => {
        attemptRef.current += 1;
        connect(term);
      }, delay);
    },
    [connect, setSession, t],
  );

  const resetReconnect = useCallback(() => {
    attemptRef.current = 0;
    clearTimeout(reconnectTimer.current);
  }, []);

  return { scheduleReconnect, attemptRef, reconnectTimer, resetReconnect };
}
