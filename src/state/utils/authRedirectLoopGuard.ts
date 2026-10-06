// Counts automatic OIDC login redirects so we can detect a redirect loop
// (a misconfigured issuer bounces between Busola and the IdP forever). The
// counter is kept in sessionStorage so it survives page loads (per tab).
export const AUTH_REDIRECT_STORAGE_KEY = 'busola.auth-redirect-timestamps';

const WINDOW_MS = 60 * 1000;
const MAX_REDIRECTS_IN_WINDOW = 3;

function readRecentRedirects(): number[] {
  try {
    const raw = sessionStorage.getItem(AUTH_REDIRECT_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - WINDOW_MS;
    return parsed.filter(
      (timestamp): timestamp is number =>
        typeof timestamp === 'number' && timestamp > cutoff,
    );
  } catch {
    return []; // fail open, broken storage must not block the login
  }
}

export function registerAuthRedirect(): void {
  try {
    sessionStorage.setItem(
      AUTH_REDIRECT_STORAGE_KEY,
      JSON.stringify([...readRecentRedirects(), Date.now()]),
    );
  } catch {
    // fail open
  }
}

export function isAuthRedirectLoop(): boolean {
  return readRecentRedirects().length >= MAX_REDIRECTS_IN_WINDOW;
}

export function resetAuthRedirectGuard(): void {
  try {
    sessionStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY);
  } catch {
    // nothing to reset
  }
}
