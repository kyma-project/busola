import parseJWT from 'jwt-decode';
import LuigiClient from '@luigi-project/client';

export function checkForTokenExpiration(idToken) {
  const expirationTimestamp = parseJWT(idToken).exp * 1000;
  if (new Date(expirationTimestamp) < Date.now()) {
    // we cannot run parent.location.reload() here
    LuigiClient.sendCustomMessage({ id: 'busola.refreshMainFrame' });
  }
}
