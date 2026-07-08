import { describe, it, expect, vi, beforeEach } from 'vitest';
import { attachSilentRenewHandlers } from '../silentRenewSetup';

type Handler = () => Promise<void> | void;

function makeMockUserManager() {
  let tokenExpiringHandler: Handler | null = null;
  const signinSilent = vi.fn();
  const removeAccessTokenExpiring = vi.fn();
  return {
    signinSilent,
    events: {
      addAccessTokenExpiring: vi.fn((h: Handler) => {
        tokenExpiringHandler = h;
      }),
      removeAccessTokenExpiring,
    },
    getUser: vi.fn(),
    fireExpiring: async () => {
      if (tokenExpiringHandler) await tokenExpiringHandler();
    },
  };
}

describe('attachSilentRenewHandlers', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
  });

  it('coalesces two concurrent addAccessTokenExpiring events into one signinSilent call', async () => {
    const um = makeMockUserManager();
    let resolveRenew: (u: any) => void = () => {};
    um.signinSilent.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRenew = resolve;
        }),
    );

    attachSilentRenewHandlers(um as any, {
      onRenewed: () => {},
      onRenewError: () => {},
    });

    // Fire the expiring handler twice back-to-back before the first resolves.
    const p1 = um.fireExpiring();
    const p2 = um.fireExpiring();

    // Single flight: signinSilent only called once for the pair.
    expect(um.signinSilent).toHaveBeenCalledTimes(1);

    resolveRenew({ id_token: 'new', access_token: 'a' });
    await Promise.all([p1, p2]);
  });

  it('coalesces a visibility change with an in-flight expiring renew', async () => {
    const um = makeMockUserManager();
    um.getUser.mockResolvedValue({ expired: true, expires_in: 0 });
    let resolveRenew: (u: any) => void = () => {};
    um.signinSilent.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRenew = resolve;
        }),
    );

    attachSilentRenewHandlers(um as any, {
      onRenewed: () => {},
      onRenewError: () => {},
    });

    const p1 = um.fireExpiring();
    document.dispatchEvent(new Event('visibilitychange'));
    // Give the async visibility handler a tick.
    await new Promise((r) => setTimeout(r, 0));

    expect(um.signinSilent).toHaveBeenCalledTimes(1);

    resolveRenew({ id_token: 'new', access_token: 'a' });
    await p1;
  });

  it('visibility handler reads the current user, not a captured stale user', async () => {
    const um = makeMockUserManager();
    // First read: user is still fresh (expires_in > 5).
    um.getUser.mockResolvedValueOnce({ expired: false, expires_in: 3600 });
    um.signinSilent.mockResolvedValue({ id_token: 'x', access_token: 'y' });

    attachSilentRenewHandlers(um as any, {
      onRenewed: () => {},
      onRenewError: () => {},
    });

    document.dispatchEvent(new Event('visibilitychange'));
    await new Promise((r) => setTimeout(r, 0));

    // Fresh user → no renew.
    expect(um.signinSilent).not.toHaveBeenCalled();
  });

  it('cleanup removes the visibilitychange listener and detaches the events handler', async () => {
    const um = makeMockUserManager();
    um.getUser.mockResolvedValue({ expired: true, expires_in: 0 });
    um.signinSilent.mockResolvedValue({ id_token: 'x', access_token: 'y' });

    const { cleanup } = attachSilentRenewHandlers(um as any, {
      onRenewed: () => {},
      onRenewError: () => {},
    });

    cleanup();

    // After cleanup, a visibility change must not trigger a renew.
    document.dispatchEvent(new Event('visibilitychange'));
    await new Promise((r) => setTimeout(r, 0));
    expect(um.signinSilent).not.toHaveBeenCalled();

    // The events.addAccessTokenExpiring handler was detached.
    expect(um.events.removeAccessTokenExpiring).toHaveBeenCalledTimes(1);
  });

  it('calls onRenewError when signinSilent rejects', async () => {
    const um = makeMockUserManager();
    const err = new Error('invalid_grant');
    um.signinSilent.mockRejectedValue(err);
    const onRenewError = vi.fn();

    attachSilentRenewHandlers(um as any, {
      onRenewed: () => {},
      onRenewError,
    });

    await um.fireExpiring();

    expect(onRenewError).toHaveBeenCalledTimes(1);
    expect(onRenewError).toHaveBeenCalledWith(err);
  });

  it('exposes a renew() that coalesces with in-flight event-driven renews', async () => {
    // Guards the SSO trySilentRefresh call site.
    const um = makeMockUserManager();
    let resolveRenew: (u: any) => void = () => {};
    um.signinSilent.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRenew = resolve;
        }),
    );

    const { renew } = attachSilentRenewHandlers(um as any, {
      onRenewed: () => {},
      onRenewError: () => {},
    });

    const p1 = um.fireExpiring();
    const p2 = renew();

    expect(um.signinSilent).toHaveBeenCalledTimes(1);

    resolveRenew({ id_token: 'x', access_token: 'y' });
    await Promise.all([p1, p2]);
  });

  it('reports renew-in-flight status via onRenewingChange callback', async () => {
    const um = makeMockUserManager();
    let resolveRenew: (u: any) => void = () => {};
    um.signinSilent.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRenew = resolve;
        }),
    );
    const onRenewingChange = vi.fn();

    attachSilentRenewHandlers(um as any, {
      onRenewed: () => {},
      onRenewError: () => {},
      onRenewingChange,
    });

    const p = um.fireExpiring();
    // Renew has begun.
    expect(onRenewingChange).toHaveBeenCalledWith(true);
    resolveRenew({ id_token: 'x', access_token: 'y' });
    await p;
    // Renew finished.
    expect(onRenewingChange).toHaveBeenLastCalledWith(false);
  });
});
