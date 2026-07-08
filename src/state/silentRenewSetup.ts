import { User, UserManager } from 'oidc-client-ts';
import { createSingleFlight } from './utils/singleFlight';

interface Options {
  onRenewed: (user: User) => void;
  onRenewError: (error: Error) => void;
  // Called with true when a renew starts, false when it settles.
  onRenewingChange?: (renewing: boolean) => void;
}

// Runs `addAccessTokenExpiring`, `visibilitychange`, and external `renew()`
// callers through one single-flight `signinSilent()`.
export function attachSilentRenewHandlers(
  userManager: UserManager,
  { onRenewed, onRenewError, onRenewingChange }: Options,
): { cleanup: () => void; renew: () => Promise<User | null> } {
  const renewSilently = createSingleFlight<User | null>();

  const runRenew = async (): Promise<User | null> => {
    onRenewingChange?.(true);
    try {
      const user = await renewSilently(() => userManager.signinSilent());
      if (user) onRenewed(user);
      return user;
    } catch (e) {
      onRenewError(e instanceof Error ? e : new Error(String(e)));
      return null;
    } finally {
      onRenewingChange?.(false);
    }
  };

  const expiringHandler = async () => {
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
      userManager.events.removeAccessTokenExpiring(expiringHandler);
      document.removeEventListener('visibilitychange', visibilityHandler);
    },
    renew: runRenew,
  };
}
