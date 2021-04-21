import LuigiClient from '@luigi-project/client';

const warningTime = 30;

export function checkTokenExpiration(idTokenExpiration) {
  if (!idTokenExpiration) return;

  const secondsLeft = (idTokenExpiration - Date.now()) / 1000;
  if (secondsLeft < warningTime) {
    LuigiClient.sendCustomMessage({
      id: 'busola.refreshAuth',
    });
  }
}
