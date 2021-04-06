import parseJWT from 'jwt-decode';
import LuigiClient from '@luigi-project/client';

export function checkForTokenExpiration(idToken) {
  try {
    const expirationTimestamp = parseJWT(idToken).exp * 1000;
    if (new Date(expirationTimestamp) < Date.now()) {
      // we cannot run parent.location.reload() here
      LuigiClient.sendCustomMessage({ id: 'busola.refreshMainFrame' });
    }
  } catch (_) {} // ignore errors from non-JWT tokens
}
