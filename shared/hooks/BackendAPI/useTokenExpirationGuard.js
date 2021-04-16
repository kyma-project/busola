import { useRef } from 'react';
import LuigiClient from '@luigi-project/client';

const warningTime = 2 * 60; // 2 mins

export function useTokenExpirationGuard() {
  const waitingForNewToken = useRef(false);

  const checkTokenExpiration = idTokenExpiration => {
    if (!idTokenExpiration) return;

    const secondsLeft = (idTokenExpiration - Date.now()) / 1000;
    if (secondsLeft > warningTime && waitingForNewToken.current) {
      waitingForNewToken.current = false;
    }

    if (secondsLeft < warningTime && !waitingForNewToken.current) {
      waitingForNewToken.current = true;
      LuigiClient.sendCustomMessage({
        id: 'busola.refreshAuth',
      });
    }
  };

  return checkTokenExpiration;
}
