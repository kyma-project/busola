import { useRef } from 'react';
import LuigiClient from '@luigi-project/client';

const warningTime = 2 * 60; // 2 mins

export function useTokenExpirationGuard() {
  const waitingForNewToken = useRef(false);

  const checkToken = idTokenExpiration => {
    try {
      if (!idTokenExpiration) return;

      const secondsLeft = (idTokenExpiration - Date.now()) / 1000;
      if (secondsLeft > warningTime && waitingForNewToken.current) {
        waitingForNewToken.current = false;
      }

      if (secondsLeft < warningTime && !waitingForNewToken.current) {
        waitingForNewToken.current = true;
        LuigiClient.sendCustomMessage({
          id: 'busola.refreshIdToken',
        });
      }
    } catch (_) {} // ignore errors from non-JWT tokens
  };

  return checkToken;
}
