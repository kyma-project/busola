import parseJWT, { JwtPayload } from 'jwt-decode';
// import LuigiClient from '@luigi-project/client';

const timeout = 30; // s

export function checkForTokenExpiration(
  token?: string,
  reloadMessageData?: any,
) {
  if (!token) return;

  try {
    const expirationTimestamp = (parseJWT(token) as JwtPayload).exp!;
    const secondsLeft =
      new Date(expirationTimestamp).getTime() - Date.now() / 1000;

    if (secondsLeft < timeout) {
      // LuigiClient.sendCustomMessage({
      //   id: 'busola.reload',
      //   ...reloadMessageData,
      // });
    }
  } catch (_) {} // ignore errors from non-JWT tokens
}
