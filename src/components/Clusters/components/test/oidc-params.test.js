import {
  parseOIDCparams,
  isOIDCExec,
  tryParseOIDCparams,
  createLoginCommand,
} from '../oidc-params';

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

  it('skips empty-string args without crashing (null-match guard)', () => {
    const input = {
      exec: {
        args: ['', '--oidc-client-id=my-client'],
      },
    };
    expect(parseOIDCparams(input)).toMatchObject({ clientId: 'my-client' });
  });

  it('concatenates duplicate non-scope params with a space', () => {
    const input = {
      exec: {
        args: ['--oidc-client-id=first', '--oidc-client-id=second'],
      },
    };
    expect(parseOIDCparams(input)).toMatchObject({ clientId: 'first second' });
  });
});

describe('tryParseOIDCparams', () => {
  it('returns parsed OIDC params for valid input', () => {
    const input = {
      exec: {
        args: [
          '--oidc-issuer-url=https://idp.example.com',
          '--oidc-client-id=my-client',
          '--oidc-extra-scope=openid',
        ],
      },
    };
    expect(tryParseOIDCparams(input)).toMatchObject({
      issuerUrl: 'https://idp.example.com',
      clientId: 'my-client',
      scopes: ['openid'],
    });
  });

  it('returns null when exec args are missing — does not throw', () => {
    expect(tryParseOIDCparams({})).toBeNull();
  });

  it('returns an empty object when only unrecognised args are present', () => {
    const input = { exec: { args: ['--unknown-param=value'] } };
    expect(tryParseOIDCparams(input)).toEqual({});
  });
});

describe('createLoginCommand', () => {
  const baseConfig = {
    issuerUrl: 'https://idp.example.com',
    clientId: 'my-client',
    clientSecret: 'my-secret',
    scopes: ['openid', 'email'],
  };

  it('builds a kubectl oidc-login get-token command from the config', () => {
    const result = createLoginCommand(baseConfig, {});
    expect(result.command).toBe('kubectl');
    expect(result.args[0]).toBe('oidc-login');
    expect(result.args[1]).toBe('get-token');
    expect(result.apiVersion).toBe('client.authentication.k8s.io/v1beta1');
  });

  it('includes each scope as a separate --oidc-extra-scope= arg', () => {
    const result = createLoginCommand(baseConfig, {});
    expect(result.args).toContain('--oidc-extra-scope=openid');
    expect(result.args).toContain('--oidc-extra-scope=email');
  });

  it('falls back to --oidc-extra-scope=openid when scopes array is empty', () => {
    const result = createLoginCommand({ ...baseConfig, scopes: [] }, {});
    expect(result.args).toContain('--oidc-extra-scope=openid');
  });

  it('serialises an empty clientSecret as --oidc-client-secret=', () => {
    const result = createLoginCommand({ ...baseConfig, clientSecret: '' }, {});
    expect(result.args).toContain('--oidc-client-secret=');
  });

  it('spreads execRest fields into the output object', () => {
    const execRest = { env: [{ name: 'FOO', value: 'bar' }] };
    const result = createLoginCommand(baseConfig, execRest);
    expect(result.env).toEqual([{ name: 'FOO', value: 'bar' }]);
  });
});
