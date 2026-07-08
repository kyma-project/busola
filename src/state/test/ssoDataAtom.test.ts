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
