import parseJWT from 'jwt-decode';
import LuigiClient from '@luigi-project/client';

const warningTime = 2 * 60; // 2 mins

let hasShowExpirationWarning = false;

export function checkForTokenExpiration(idToken) {
  try {
    const expirationTimestamp = parseJWT(idToken).exp;
    const secondsLeft = new Date(expirationTimestamp) - Date.now() / 1000;

    if (secondsLeft < warningTime && !hasShowExpirationWarning) {
      hasShowExpirationWarning = true;
      LuigiClient.sendCustomMessage({
        id: 'busola.showTokenExpirationWarning',
      });
    } else if (secondsLeft < 0) {
      // we cannot run parent.location.reload() here
      LuigiClient.sendCustomMessage({ id: 'busola.refreshMainFrame' });
    }
  } catch (_) {} // ignore errors from non-JWT tokens
}
