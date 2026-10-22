import { describe, it, expect } from 'vitest';
import {
  getContext,
  getUserIndex,
  getUser,
  hasKubeconfigAuth,
} from '../shared';
import { ValidKubeconfig } from 'types';

const makeKubeconfig = (
  overrides: Partial<ValidKubeconfig> = {},
): ValidKubeconfig => ({
  apiVersion: 'v1',
  kind: 'Config',
  'current-context': 'dev',
  clusters: [
    {
      name: 'dev-cluster',
      cluster: {
        server: 'https://dev.example.com',
        'certificate-authority-data': 'abc',
      },
    },
  ],
  users: [{ name: 'dev-user', user: { token: 'dev-token' } }],
  contexts: [
    { name: 'dev', context: { cluster: 'dev-cluster', user: 'dev-user' } },
  ],
  ...overrides,
});

// ─── getContext ───────────────────────────────────────────────────────────────

describe('getContext', () => {
  it('returns first cluster and user when contexts array is empty', () => {
    const kubeconfig = makeKubeconfig({ contexts: [], 'current-context': '' });
    const result = getContext(kubeconfig, '');
    expect(result.cluster).toEqual(kubeconfig.clusters[0]);
    expect(result.user).toEqual(kubeconfig.users[0]);
  });

  it('returns first cluster and user when no current-context is set', () => {
    const kubeconfig = makeKubeconfig({ contexts: [], 'current-context': '' });
    const result = getContext(kubeconfig, '');
    expect(result.cluster?.name).toBe('dev-cluster');
    expect(result.user?.name).toBe('dev-user');
  });

  it('returns correct cluster and user for a named context', () => {
    const kubeconfig = makeKubeconfig();
    const result = getContext(kubeconfig, 'dev');
    expect(result.cluster?.name).toBe('dev-cluster');
    expect(result.user?.name).toBe('dev-user');
    expect(result.namespace).toBeUndefined();
  });

  it('includes namespace when the context specifies one', () => {
    const kubeconfig = makeKubeconfig({
      contexts: [
        {
          name: 'dev',
          context: {
            cluster: 'dev-cluster',
            user: 'dev-user',
            namespace: 'my-ns',
          },
        },
      ],
    });
    const result = getContext(kubeconfig, 'dev');
    expect(result.namespace).toBe('my-ns');
  });

  it('falls back to current-context when contextName is empty', () => {
    const kubeconfig = makeKubeconfig({ 'current-context': 'dev' });
    const result = getContext(kubeconfig, '');
    expect(result.cluster?.name).toBe('dev-cluster');
    expect(result.user?.name).toBe('dev-user');
  });

  it('throws when the named cluster is not in the clusters list', () => {
    const kubeconfig = makeKubeconfig({
      contexts: [
        {
          name: 'dev',
          context: { cluster: 'missing-cluster', user: 'dev-user' },
        },
      ],
    });
    expect(() => getContext(kubeconfig, 'dev')).toThrow(
      'Unable to add context',
    );
  });

  it('throws when the named user is not in the users list', () => {
    const kubeconfig = makeKubeconfig({
      contexts: [
        {
          name: 'dev',
          context: { cluster: 'dev-cluster', user: 'missing-user' },
        },
      ],
    });
    expect(() => getContext(kubeconfig, 'dev')).toThrow(
      'Unable to add context',
    );
  });

  it('selects the right context from a multi-context kubeconfig', () => {
    const kubeconfig = makeKubeconfig({
      clusters: [
        {
          name: 'dev-cluster',
          cluster: {
            server: 'https://dev.example.com',
            'certificate-authority-data': 'abc',
          },
        },
        {
          name: 'prod-cluster',
          cluster: {
            server: 'https://prod.example.com',
            'certificate-authority-data': 'xyz',
          },
        },
      ],
      users: [
        { name: 'dev-user', user: { token: 'dev-token' } },
        { name: 'prod-user', user: { token: 'prod-token' } },
      ],
      contexts: [
        { name: 'dev', context: { cluster: 'dev-cluster', user: 'dev-user' } },
        {
          name: 'prod',
          context: { cluster: 'prod-cluster', user: 'prod-user' },
        },
      ],
    });
    const result = getContext(kubeconfig, 'prod');
    expect(result.cluster?.name).toBe('prod-cluster');
    expect(result.user?.name).toBe('prod-user');
  });
});

// ─── getUserIndex ─────────────────────────────────────────────────────────────

describe('getUserIndex', () => {
  it('returns 0 when kubeconfig is undefined', () => {
    expect(getUserIndex(undefined)).toBe(0);
  });

  it('returns 0 when kubeconfig has no contexts', () => {
    const kubeconfig = makeKubeconfig({ contexts: [] });
    expect(getUserIndex(kubeconfig)).toBe(0);
  });

  it('returns the correct index for a matching user', () => {
    const kubeconfig = makeKubeconfig({
      users: [
        { name: 'other-user', user: { token: 'other' } },
        { name: 'dev-user', user: { token: 'dev-token' } },
      ],
    });
    expect(getUserIndex(kubeconfig)).toBe(1);
  });

  it('uses the first context when current-context is -all-', () => {
    const kubeconfig = makeKubeconfig({
      'current-context': '-all-',
      contexts: [
        { name: 'dev', context: { cluster: 'dev-cluster', user: 'dev-user' } },
      ],
    });
    // dev-user is at index 0
    expect(getUserIndex(kubeconfig)).toBe(0);
  });

  it('returns 0 when the user referenced by the context is not found', () => {
    const kubeconfig = makeKubeconfig({
      contexts: [
        {
          name: 'dev',
          context: { cluster: 'dev-cluster', user: 'ghost-user' },
        },
      ],
    });
    expect(getUserIndex(kubeconfig)).toBe(0);
  });
});

// ─── getUser ─────────────────────────────────────────────────────────────────

describe('getUser', () => {
  it('returns undefined when kubeconfig has no contexts', () => {
    const kubeconfig = makeKubeconfig({ contexts: [] });
    expect(getUser(kubeconfig)).toBeUndefined();
  });

  it('returns the user object for the current context', () => {
    const kubeconfig = makeKubeconfig();
    expect(getUser(kubeconfig)).toEqual({ token: 'dev-token' });
  });

  it('returns undefined when the context references a user that does not exist', () => {
    const kubeconfig = makeKubeconfig({
      contexts: [
        { name: 'dev', context: { cluster: 'dev-cluster', user: 'nobody' } },
      ],
    });
    expect(getUser(kubeconfig)).toBeUndefined();
  });
});

// ─── hasKubeconfigAuth ────────────────────────────────────────────────────────

describe('hasKubeconfigAuth', () => {
  it('returns the token when the user authenticates with a bearer token', () => {
    const kubeconfig = makeKubeconfig();
    expect(hasKubeconfigAuth(kubeconfig)).toBe('dev-token');
  });

  it('returns true when the user authenticates with a client certificate', () => {
    const kubeconfig = makeKubeconfig({
      users: [
        {
          name: 'dev-user',
          user: {
            'client-certificate-data': 'cert-data',
            'client-key-data': 'key-data',
          },
        },
      ],
    });
    expect(hasKubeconfigAuth(kubeconfig)).toBeTruthy();
  });

  it('returns false when the user has client-certificate-data but no client-key-data', () => {
    const kubeconfig = makeKubeconfig({
      users: [
        {
          name: 'dev-user',
          user: {
            'client-certificate-data': 'cert-data',
            'client-key-data': '',
          },
        },
      ],
    });
    expect(hasKubeconfigAuth(kubeconfig)).toBeFalsy();
  });

  it('returns OIDC params when the user authenticates via OIDC exec plugin', () => {
    const kubeconfig = makeKubeconfig({
      users: [
        {
          name: 'dev-user',
          user: {
            exec: {
              apiVersion: 'client.authentication.k8s.io/v1beta1',
              command: 'kubectl',
              args: [
                '--oidc-issuer-url=https://idp.example.com',
                '--oidc-client-id=my-client',
                '--oidc-extra-scope=openid',
              ],
            },
          },
        },
      ],
    });
    const result = hasKubeconfigAuth(kubeconfig);
    expect(result).toMatchObject({
      issuerUrl: 'https://idp.example.com',
      clientId: 'my-client',
      scopes: ['openid'],
    });
  });

  it('returns false when there is no user for the current context', () => {
    const kubeconfig = makeKubeconfig({
      contexts: [
        { name: 'dev', context: { cluster: 'dev-cluster', user: 'no-one' } },
      ],
    });
    expect(hasKubeconfigAuth(kubeconfig)).toBeFalsy();
  });

  it('returns false when kubeconfig has no contexts', () => {
    const kubeconfig = makeKubeconfig({ contexts: [] });
    expect(hasKubeconfigAuth(kubeconfig)).toBeFalsy();
  });
});
