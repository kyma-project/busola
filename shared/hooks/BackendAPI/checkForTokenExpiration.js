import parseJWT from 'jwt-decode';
import LuigiClient from '@luigi-project/client';

const timeout = 30; // s

export function checkForTokenExpiration(token, reloadMessageData) {
  try {
    const expirationTimestamp = parseJWT(token).exp;
    const secondsLeft = new Date(expirationTimestamp) - Date.now() / 1000;

    if (secondsLeft < timeout) {
      LuigiClient.sendCustomMessage({
        id: 'busola.reload',
        ...reloadMessageData,
      });
    }
  } catch (_) {} // ignore errors from non-JWT tokens
}
