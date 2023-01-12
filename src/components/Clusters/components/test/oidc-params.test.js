import { parseOIDCparams } from '../oidc-params';

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
        ],
      },
    };
    expect(parseOIDCparams(input)).toMatchObject({
      clientId: 'hasselhoff',
      clientSecret: 'hasselhoffsecret',
      issuerUrl: 'https://coastguard.gov.us',
      scope: 'peach',
    });
  });

  it('Concatinates params', () => {
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
      scope: 'peach melon plum',
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
