import { describe, it, expect } from 'vitest';
import { getUserDetail } from '../ContextChooser/helpers';

describe('getUserDetail', () => {
  const users = [
    {
      name: 'oidc-user',
      user: {
        exec: {
          command: 'kubectl',
          args: [
            '--oidc-issuer-url=https://idp.example.com',
            '--oidc-client-id=my-client',
            '--oidc-extra-scope=openid',
          ],
        },
      },
    },
  ];

  it('returns null when the users array is undefined', () => {
    expect(
      getUserDetail('oidc-user', '--oidc-client-id=', undefined),
    ).toBeNull();
  });

  it('returns null when the user has no exec args', () => {
    const usersWithoutArgs = [{ name: 'oidc-user', user: { exec: {} } }];
    expect(
      getUserDetail('oidc-user', '--oidc-client-id=', usersWithoutArgs as any),
    ).toBeNull();
  });

  it('returns null when the named user is not found in the list', () => {
    expect(
      getUserDetail('missing-user', '--oidc-client-id=', users as any),
    ).toBeNull();
  });

  it('returns the empty-text placeholder when the parameter is not present in args', () => {
    expect(
      getUserDetail('oidc-user', '--oidc-client-secret=', users as any),
    ).toBe('-');
  });

  it('returns the parameter value when the arg is found', () => {
    expect(getUserDetail('oidc-user', '--oidc-client-id=', users as any)).toBe(
      'my-client',
    );
    expect(getUserDetail('oidc-user', '--oidc-issuer-url=', users as any)).toBe(
      'https://idp.example.com',
    );
    expect(
      getUserDetail('oidc-user', '--oidc-extra-scope=', users as any),
    ).toBe('openid');
  });
});
