import { JwtPayload, jwtDecode } from 'jwt-decode';
import { setSSOAuthData } from '../../../state/ssoDataAtom';

const timeout = 30; // s

export function checkForTokenExpiration(
  token?: string,
  reasonData?: { reason: string; message: string },
) {
  if (!token) return;

  try {
    const expirationTimestamp = (jwtDecode(token) as JwtPayload).exp!;
    const secondsLeft =
      new Date(expirationTimestamp).getTime() - Date.now() / 1000;

    if (secondsLeft < timeout) {
      setSSOAuthData(null);

      window.location.reload();
    }
  } catch (_) {} // ignore errors from non-JWT tokens
}
