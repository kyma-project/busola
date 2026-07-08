import { describe, it, expect, vi, beforeEach } from 'vitest';

const userManagerCtor = vi.fn();

vi.mock('oidc-client-ts', () => ({
  UserManager: userManagerCtor,
}));

describe('SSO UserManager configuration', () => {
  beforeEach(() => {
    userManagerCtor.mockReset();
    vi.resetModules();
    sessionStorage.clear();
  });

  it('constructs the UserManager with automaticSilentRenew disabled', async () => {
    const { createSSOUserManager } = await import('../ssoDataAtom');

    createSSOUserManager({
      issuerUrl: 'https://issuer.example.com',
      clientId: 'my-client',
      scope: 'openid profile',
    });

    expect(userManagerCtor).toHaveBeenCalledTimes(1);
    const opts = userManagerCtor.mock.calls[0][0];
    expect(opts).toMatchObject({
      automaticSilentRenew: false,
    });
  });
});

describe('SSO silent-renew wiring', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => 'visible',
    });
  });

  it('collapses concurrent addAccessTokenExpiring + visibilitychange into one signinSilent', async () => {
    // Reuses the shared attachSilentRenewHandlers helper — this test simply
    // asserts the SSO code path exports it and uses the single-flight guard.
    const { attachSSOSilentRenew } = await import('../ssoDataAtom');

    let expiringHandler: () => Promise<void> = async () => {};
    const signinSilent = vi.fn();
    let resolveRenew: (u: any) => void = () => {};
    signinSilent.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRenew = resolve;
        }),
    );

    const um = {
      signinSilent,
      events: {
        addAccessTokenExpiring: (h: () => Promise<void>) => {
          expiringHandler = h;
        },
        removeAccessTokenExpiring: vi.fn(),
      },
      getUser: vi.fn().mockResolvedValue({ expired: true, expires_in: 0 }),
    };

    attachSSOSilentRenew(um as any, {
      onRenewed: () => {},
      onRenewError: () => {},
    });

    const p1 = expiringHandler();
    document.dispatchEvent(new Event('visibilitychange'));
    await new Promise((r) => setTimeout(r, 0));

    expect(signinSilent).toHaveBeenCalledTimes(1);
    resolveRenew({ id_token: 'x' });
    await p1;
  });
});
