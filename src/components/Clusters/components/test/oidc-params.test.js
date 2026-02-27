import { parseOIDCparams, isOIDCExec } from '../oidc-params';

describe('isOIDCExec', () => {
  it('returns true when exec args contain --oidc-issuer-url', () => {
    const exec = {
      command: 'kubectl',
      args: [
        'oidc-login',
        'get-token',
        '--oidc-issuer-url=https://example.com',
        '--oidc-client-id=myid',
      ],
    };
    expect(isOIDCExec(exec)).toBe(true);
  });

  it('returns false for a generic exec plugin without OIDC args', () => {
    const exec = {
      command: 'sh',
      args: ['mock-oidc.sh'],
    };
    expect(isOIDCExec(exec)).toBe(false);
  });

  it('returns false when exec has empty args array', () => {
    const exec = { command: 'my-plugin', args: [] };
    expect(isOIDCExec(exec)).toBe(false);
  });

  it('returns false when exec has no args property', () => {
    const exec = { command: 'my-plugin' };
    expect(isOIDCExec(exec)).toBe(false);
  });

  it('returns false for undefined exec', () => {
    expect(isOIDCExec(undefined)).toBe(false);
  });
});

describe('parseOIDCparams', () => {
  it('Throw for empty data', () => {
    const input = {};
    expect(() => parseOIDCparams(input)).toThrow(Error);
  });

  it('Parses params properly', () => {
    const input = {
      exec: {
        args: [
          '--oidc-issuer-url=https://coastguard.gov.us',
          '--oidc-client-id=hasselhoff',
          '--oidc-client-secret=hasselhoffsecret',
          '--oidc-extra-scope=peach',
          '--oidc-use-access-token',
        ],
      },
    };
    expect(parseOIDCparams(input)).toMatchObject({
      clientId: 'hasselhoff',
      clientSecret: 'hasselhoffsecret',
      issuerUrl: 'https://coastguard.gov.us',
      scopes: ['peach'],
      useAccessToken: true,
    });
  });

  it('Parses params with equal sign in the value properly', () => {
    const input = {
      exec: {
        args: [
          '--oidc-issuer-url=https://coastguard.gov.us',
          '--oidc-client-id=hasselhoff',
          '--oidc-client-secret=hasselhoff=secret',
          '--oidc-extra-scope=peach',
        ],
      },
    };
    expect(parseOIDCparams(input)).toMatchObject({
      clientId: 'hasselhoff',
      clientSecret: 'hasselhoff=secret',
      issuerUrl: 'https://coastguard.gov.us',
      scopes: ['peach'],
    });
  });

  it('Multiple scopes', () => {
    const input = {
      exec: {
        args: [
          '--oidc-extra-scope=peach',
          '--oidc-extra-scope=melon',
          '--oidc-extra-scope=plum',
        ],
      },
    };
    expect(parseOIDCparams(input)).toMatchObject({
      scopes: ['peach', 'melon', 'plum'],
    });
  });

  it('Ignores not recognized params', () => {
    const input = {
      exec: {
        args: ['--patroling=on-a-jetski'],
      },
    };
    expect(parseOIDCparams(input)).toMatchObject({});
  });
});
