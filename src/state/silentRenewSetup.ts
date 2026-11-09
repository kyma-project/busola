import { User, UserManager } from 'oidc-client-ts';
import { createSingleFlight } from './utils/singleFlight';

interface Options {
  onRenewed: (user: User) => void;
  onRenewError: (error: Error) => void;
  // Called with true when a renew starts, false when it settles.
  onRenewingChange?: (renewing: boolean) => void;
}

const SHORT_TOKEN_RENEW_MARGIN_S = 5;

// Runs `addAccessTokenExpiring`, `visibilitychange`, and external `renew()`
// callers through one single-flight `signinSilent()`.
export function attachSilentRenewHandlers(
  userManager: UserManager,
  { onRenewed, onRenewError, onRenewingChange }: Options,
): { cleanup: () => void; renew: () => Promise<User | null> } {
  const renewSilently = createSingleFlight<User | null>();

  const expiringLeadS =
    userManager.settings.accessTokenExpiringNotificationTimeInSeconds;
  let renewedAt = 0;
  let renewedTokenExpiresAt = 0;
  let deferredRenew: ReturnType<typeof setTimeout> | undefined;

  const runRenew = async (): Promise<User | null> => {
    clearTimeout(deferredRenew);
    onRenewingChange?.(true);
    try {
      const user = await renewSilently(() => userManager.signinSilent());
      if (user) onRenewed(user);
      renewedAt = Date.now() / 1000;
      renewedTokenExpiresAt = user?.expires_at ?? 0;
      return user;
    } catch (e) {
      renewedTokenExpiresAt = 0;
      onRenewError(e instanceof Error ? e : new Error(String(e)));
      return null;
    } finally {
      onRenewingChange?.(false);
    }
  };

  const expiringHandler = async () => {
    // No getUser() here, it restarts the timer and fires this event again.
    const lifetimeS = renewedTokenExpiresAt - renewedAt;
    const secondsLeft = renewedTokenExpiresAt - Date.now() / 1000;
    // For a short-lived token this event fires right after every renewal.
    if (
      lifetimeS < 2 * expiringLeadS &&
      secondsLeft > SHORT_TOKEN_RENEW_MARGIN_S
    ) {
      clearTimeout(deferredRenew);
      deferredRenew = setTimeout(
        runRenew,
        (secondsLeft - SHORT_TOKEN_RENEW_MARGIN_S) * 1000,
      );
      return;
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
