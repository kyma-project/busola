import { User, UserManager } from 'oidc-client-ts';
import { createSingleFlight } from './utils/singleFlight';

interface Options {
  onRenewed: (user: User) => void;
  onRenewError: (error: Error) => void;
  // Called with true when a renew starts, false when it settles.
  onRenewingChange?: (renewing: boolean) => void;
}

// A renewal this recent means the new token was already close to expiry.
const SHORT_TOKEN_WINDOW_MS = 5000;
// How long before its expiry such a short-lived token is renewed.
const SHORT_TOKEN_RENEW_MARGIN_S = 5;

// Runs `addAccessTokenExpiring`, `visibilitychange`, and external `renew()`
// callers through one single-flight `signinSilent()`.
export function attachSilentRenewHandlers(
  userManager: UserManager,
  { onRenewed, onRenewError, onRenewingChange }: Options,
): { cleanup: () => void; renew: () => Promise<User | null> } {
  const renewSilently = createSingleFlight<User | null>();

  let lastRenewAt = 0;
  let renewedTokenExpiresAt = 0; // epoch seconds
  let deferredRenew: ReturnType<typeof setTimeout> | undefined;

  const runRenew = async (): Promise<User | null> => {
    clearTimeout(deferredRenew);
    onRenewingChange?.(true);
    try {
      const user = await renewSilently(() => userManager.signinSilent());
      if (user) onRenewed(user);
      renewedTokenExpiresAt = user?.expires_at ?? 0;
      return user;
    } catch (e) {
      onRenewError(e instanceof Error ? e : new Error(String(e)));
      return null;
    } finally {
      lastRenewAt = Date.now();
      onRenewingChange?.(false);
    }
  };

  const expiringHandler = async () => {
    // An IdP can cap a token at the end of its session. Such a token is
    // "expiring" as soon as it arrives, and renewing it right away would
    // repeat about once a second. Renew it once, shortly before it runs out.
    if (Date.now() - lastRenewAt < SHORT_TOKEN_WINDOW_MS) {
      // Not read via getUser(): that reloads the library's timers and fires
      // this event again.
      const secondsLeft = renewedTokenExpiresAt - Date.now() / 1000;
      if (secondsLeft > SHORT_TOKEN_RENEW_MARGIN_S) {
        clearTimeout(deferredRenew);
        deferredRenew = setTimeout(
          runRenew,
          (secondsLeft - SHORT_TOKEN_RENEW_MARGIN_S) * 1000,
        );
        return;
      }
    }
    await runRenew();
  };
  userManager.events.addAccessTokenExpiring(expiringHandler);

  const visibilityHandler = async () => {
    if (document.visibilityState !== 'visible') return;
    const current = await userManager.getUser();
    if (!current) return;
    if (current.expired || (current.expires_in && current.expires_in <= 5)) {
      await runRenew();
    }
  };
  document.addEventListener('visibilitychange', visibilityHandler);

  return {
    cleanup: () => {
      clearTimeout(deferredRenew);
      userManager.events.removeAccessTokenExpiring(expiringHandler);
      document.removeEventListener('visibilitychange', visibilityHandler);
    },
    renew: runRenew,
  };
}
