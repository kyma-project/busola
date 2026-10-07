// Tracks automatic OIDC redirects to detect redirect loops; stored in sessionStorage to survive page loads.
export const AUTH_REDIRECT_STORAGE_KEY = 'busola.auth-redirect-timestamps';

const WINDOW_MS = 60 * 1000;
const MAX_REDIRECTS_IN_WINDOW = 3;

// One expiry can fire several handlers; only the first may redirect.
// The claim expires in case the redirect never leaves the page. Half the window: one page can't trip the guard.
const CLAIM_TTL_MS = WINDOW_MS / 2;
let reauthClaimedAt: number | null = null;

export function tryClaimReauthRedirect(): boolean {
  const now = Date.now();
  if (reauthClaimedAt !== null && now - reauthClaimedAt < CLAIM_TTL_MS) {
    return false;
  }
  reauthClaimedAt = now;
  return true;
}

export function resetReauthRedirectClaim(): void {
  reauthClaimedAt = null;
}

// The Back button can restore this page from the bfcache with the claim still set.
window.addEventListener('pageshow', (event) => {
  if (event.persisted) resetReauthRedirectClaim();
});

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
  resetReauthRedirectClaim();
  try {
    sessionStorage.removeItem(AUTH_REDIRECT_STORAGE_KEY);
  } catch {
    // nothing to reset
  }
}
