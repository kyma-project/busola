import parseJWT from 'jwt-decode';
import LuigiClient from '@luigi-project/client';

const timeout = 30; // s

export function checkForTokenExpiration(idToken) {
  try {
    const expirationTimestamp = parseJWT(idToken).exp;
    const secondsLeft = new Date(expirationTimestamp) - Date.now() / 1000;

    if (secondsLeft < timeout) {
      LuigiClient.sendCustomMessage({
        id: 'busola.reload',
      });
    }
  } catch (_) {} // ignore errors from non-JWT tokens
}
