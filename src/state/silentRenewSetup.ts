import { User, UserManager } from 'oidc-client-ts';
import { createSingleFlight } from './utils/singleFlight';

interface Options {
  onRenewed: (user: User) => void;
  onRenewError: (error: Error) => void;
  // Fires true when a renew starts, false when it settles; lets callers
  // suppress recovery paths that would misread the transient as a session drop.
  onRenewingChange?: (renewing: boolean) => void;
}

// Routes both silent-renewal triggers (library `addAccessTokenExpiring` and
// browser `visibilitychange`) through one single-flight `signinSilent()` call,
// so a rotating refresh token isn't consumed twice. Returns a cleanup that
// detaches both listeners — call on cluster change / unmount.
export function attachSilentRenewHandlers(
  userManager: UserManager,
  { onRenewed, onRenewError, onRenewingChange }: Options,
) {
  const renewSilently = createSingleFlight<User | null>();

  const runRenew = async (): Promise<void> => {
    onRenewingChange?.(true);
    try {
      const user = await renewSilently(() => userManager.signinSilent());
      if (user) onRenewed(user);
    } catch (e) {
      onRenewError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      onRenewingChange?.(false);
    }
  };

  const expiringHandler = () => runRenew();
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

  return () => {
    userManager.events.removeAccessTokenExpiring(expiringHandler);
    document.removeEventListener('visibilitychange', visibilityHandler);
  };
}
