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

    const p1 = um.fireExpiring();
    const p2 = um.fireExpiring();

    expect(um.signinSilent).toHaveBeenCalledTimes(1);

    resolveRenew({ id_token: 'new', access_token: 'a' });
    await Promise.all([p1, p2]);
  });

  it('exposes a renew() that coalesces with in-flight event-driven renews', async () => {
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

  it('cleanup removes the visibilitychange listener and detaches the events handler', async () => {
    const um = makeMockUserManager();
    um.getUser.mockResolvedValue({ expired: true, expires_in: 0 });
    um.signinSilent.mockResolvedValue({ id_token: 'x', access_token: 'y' });

    const { cleanup } = attachSilentRenewHandlers(um as any, {
      onRenewed: () => {},
      onRenewError: () => {},
    });

    cleanup();

    document.dispatchEvent(new Event('visibilitychange'));
    await new Promise((r) => setTimeout(r, 0));
    expect(um.signinSilent).not.toHaveBeenCalled();

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
});
