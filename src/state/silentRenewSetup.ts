import { User, UserManager } from 'oidc-client-ts';
import { createSingleFlight } from './utils/singleFlight';

interface Options {
  onRenewed: (user: User) => void;
  onRenewError: (error: Error) => void;
  // Fires true when a renew starts, false when it settles; lets callers
  // suppress recovery paths that would misread the transient as a session drop.
  onRenewingChange?: (renewing: boolean) => void;
}

// Routes every silent-renew trigger — library `addAccessTokenExpiring`, browser
// `visibilitychange`, and the returned `renew()` for callers like SSO
// `checkForTokenExpiration` — through one single-flight `signinSilent()`.
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
