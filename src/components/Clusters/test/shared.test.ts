import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getContext,
  getUserIndex,
  getUser,
  hasKubeconfigAuth,
  deleteCluster,
  addByContext,
} from '../shared';
import { ValidKubeconfig } from 'types';
import { hasNonOidcAuth, createUserManager } from 'state/authDataAtom';

vi.mock('state/authDataAtom', () => ({
  hasNonOidcAuth: vi.fn(),
  createUserManager: vi.fn(),
}));

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

const makeClustersInfo = () => ({
  setClusters: vi.fn(),
  setCurrentCluster: vi.fn(),
  navigate: vi.fn(),
  currentCluster: null,
  clusters: {},
});

describe('getContext', () => {
  it('returns first cluster and user when no current-context is set', () => {
    //given
    const kubeconfig = makeKubeconfig({ contexts: [], 'current-context': '' });
    //when
    const result = getContext(kubeconfig, '');
    //then
    expect(result.cluster?.name).toBe('dev-cluster');
    expect(result.user?.name).toBe('dev-user');
  });

  it('returns the matched cluster and user for a named context', () => {
    const kubeconfig = makeKubeconfig();
    const result = getContext(kubeconfig, 'dev');
    expect(result.cluster?.name).toBe('dev-cluster');
    expect(result.user?.name).toBe('dev-user');
    expect(result.namespace).toBeUndefined();
  });

  it('includes namespace when the context defines one', () => {
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
    expect(getContext(kubeconfig, 'dev').namespace).toBe('my-ns');
  });

  it('falls back to current-context when contextName is empty', () => {
    //given
    const kubeconfig = makeKubeconfig({
      'current-context': 'dev',
      clusters: [
        {
          name: 'dev-cluster',
          cluster: {
            server: 'https://dev.example.com',
            'certificate-authority-data': 'abc',
          },
        },
        {
          name: 'other-cluster',
          cluster: {
            server: 'https://other.example.com',
            'certificate-authority-data': 'xyz',
          },
        },
      ],
      users: [
        { name: 'dev-user', user: { token: 'dev-token' } },
        { name: 'other-user', user: { token: 'other-token' } },
      ],
      contexts: [
        { name: 'dev', context: { cluster: 'dev-cluster', user: 'dev-user' } },
        {
          name: 'other',
          context: { cluster: 'other-cluster', user: 'other-user' },
        },
      ],
    });
    //when
    const result = getContext(kubeconfig, '');
    //then
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
      'Unable to add context. Error: cluster not found',
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
      'Unable to add context. Error: user not found',
    );
  });

  it('selects the right context from a multi-context kubeconfig', () => {
    //given
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
    //when
    const result = getContext(kubeconfig, 'prod');
    //then
    expect(result.cluster?.name).toBe('prod-cluster');
    expect(result.user?.name).toBe('prod-user');
  });

  it('uses the first matching context when context names are duplicated', () => {
    const kubeconfig = makeKubeconfig({
      clusters: [
        {
          name: 'cluster-1',
          cluster: {
            server: 'https://c1.example.com',
            'certificate-authority-data': 'abc',
          },
        },
        {
          name: 'cluster-2',
          cluster: {
            server: 'https://c2.example.com',
            'certificate-authority-data': 'xyz',
          },
        },
      ],
      users: [
        { name: 'user-1', user: { token: 'token-1' } },
        { name: 'user-2', user: { token: 'token-2' } },
      ],
      contexts: [
        { name: 'dev', context: { cluster: 'cluster-1', user: 'user-1' } },
        { name: 'dev', context: { cluster: 'cluster-2', user: 'user-2' } },
      ],
    });

    const result = getContext(kubeconfig, 'dev');
    expect(result.cluster?.name).toBe('cluster-1');
    expect(result.user?.name).toBe('user-1');
  });
});

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
      users: [
        { name: 'other-user', user: { token: 'other' } },
        { name: 'dev-user', user: { token: 'dev-token' } },
      ],
      contexts: [
        { name: 'dev', context: { cluster: 'dev-cluster', user: 'dev-user' } },
      ],
    });
    expect(getUserIndex(kubeconfig)).toBe(1);
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
    expect(hasKubeconfigAuth(kubeconfig)).toBe(true);
  });

  it('returns false when the user has client-key-data but no client-certificate-data', () => {
    const kubeconfig = makeKubeconfig({
      users: [
        {
          name: 'dev-user',
          user: {
            'client-certificate-data': '',
            'client-key-data': 'key-data',
          },
        },
      ],
    });
    expect(hasKubeconfigAuth(kubeconfig)).toBeFalsy();
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

describe('deleteCluster', () => {
  beforeEach(() => {
    vi.mocked(hasNonOidcAuth).mockReset();
    vi.mocked(createUserManager).mockReset();
  });

  it('removes the cluster from the map for a non-OIDC user without calling removeUser', () => {
    vi.mocked(hasNonOidcAuth).mockReturnValue(true);

    let capturedUpdater: ((prev: any) => any) | undefined;
    const setClusters = vi.fn((updater) => {
      capturedUpdater = updater;
    });

    deleteCluster('dev', { setClusters } as any);

    const prev = {
      dev: { currentContext: { user: { user: { token: 'dev-token' } } } },
      other: { currentContext: { user: { user: { token: 'other-token' } } } },
    };
    const result = capturedUpdater!(prev);

    expect(result).toEqual({
      other: { currentContext: { user: { user: { token: 'other-token' } } } },
    });
    expect(createUserManager).not.toHaveBeenCalled();
  });

  it('calls userManager.removeUser and removes the cluster when deleting an OIDC cluster', () => {
    const removeUser = vi.fn().mockResolvedValue(undefined);
    vi.mocked(hasNonOidcAuth).mockReturnValue(false);
    vi.mocked(createUserManager).mockReturnValue({ removeUser } as any);

    let capturedUpdater: ((prev: any) => any) | undefined;
    const setClusters = vi.fn((updater) => {
      capturedUpdater = updater;
    });

    deleteCluster('oidc-cluster', { setClusters } as any);

    const prev = {
      'oidc-cluster': {
        currentContext: {
          user: {
            user: {
              exec: {
                args: [
                  '--oidc-issuer-url=https://idp.example.com',
                  '--oidc-client-id=my-client',
                ],
              },
            },
          },
        },
      },
    };
    const result = capturedUpdater!(prev);

    expect(createUserManager).toHaveBeenCalled();
    expect(removeUser).toHaveBeenCalled();
    expect(result).toEqual({});
  });

  it('does not crash when the cluster name is not present in the map', () => {
    vi.mocked(hasNonOidcAuth).mockReturnValue(true);
    const setClusters = vi.fn((updater) => updater({}));

    expect(() =>
      deleteCluster('missing', { setClusters } as any),
    ).not.toThrow();
  });
});

describe('addByContext', () => {
  beforeEach(() => {
    vi.mocked(hasNonOidcAuth).mockReset();
    vi.mocked(createUserManager).mockReset();
  });

  it('adds the cluster to the store and navigates when auth is present', () => {
    const kubeconfig = makeKubeconfig();
    const clustersInfo = makeClustersInfo();

    addByContext(
      {
        kubeconfig,
        context: kubeconfig.contexts[0],
        storage: 'sessionStorage',
        config: {},
      },
      clustersInfo as any,
    );

    expect(clustersInfo.setClusters).toHaveBeenCalled();
    expect(clustersInfo.navigate).toHaveBeenCalledWith(
      expect.stringContaining('/cluster/'),
    );
  });

  it('throws when the kubeconfig contains no matching cluster', () => {
    const kubeconfig = makeKubeconfig();
    const badContext = {
      name: 'dev',
      context: { cluster: 'missing-cluster', user: 'dev-user' },
    };

    expect(() =>
      addByContext(
        {
          kubeconfig,
          context: badContext,
          storage: 'sessionStorage',
          config: {},
        },
        makeClustersInfo() as any,
      ),
    ).toThrow('Unable to add context');
  });

  it('throws when kubeconfig has no auth and no manualKubeConfigId', () => {
    const kubeconfig = makeKubeconfig({
      users: [{ name: 'dev-user', user: {} as any }],
    });

    expect(() =>
      addByContext(
        {
          kubeconfig,
          context: kubeconfig.contexts[0],
          storage: 'sessionStorage',
          config: {},
        },
        makeClustersInfo() as any,
      ),
    ).toThrow('Unable to add context');
  });

  it('opens the auth form and returns without adding when manualKubeConfigId has no auth yet', () => {
    const kubeconfig = makeKubeconfig({
      users: [{ name: 'dev-user', user: {} as any }],
    });
    const setManualKubeConfigId = vi.fn();
    const clustersInfo = makeClustersInfo();

    addByContext(
      {
        kubeconfig,
        context: kubeconfig.contexts[0],
        storage: 'sessionStorage',
        config: {},
      },
      clustersInfo as any,
      {
        manualKubeConfigId: { formOpen: false, auth: null },
        setManualKubeConfigId,
      },
    );

    expect(setManualKubeConfigId).toHaveBeenCalledWith(expect.any(Function));
    const [capturedFn] = vi.mocked(setManualKubeConfigId).mock.calls[0];
    expect(capturedFn({ formOpen: false, auth: null })).toMatchObject({
      formOpen: true,
    });
    expect(clustersInfo.setClusters).not.toHaveBeenCalled();
  });

  it('injects the provided auth and adds the cluster when manualKubeConfigId carries auth', () => {
    const kubeconfig = makeKubeconfig({
      users: [{ name: 'dev-user', user: {} as any }],
    });
    const setManualKubeConfigId = vi.fn();
    const clustersInfo = makeClustersInfo();

    addByContext(
      {
        kubeconfig,
        context: kubeconfig.contexts[0],
        storage: 'sessionStorage',
        config: {},
      },
      clustersInfo as any,
      {
        manualKubeConfigId: {
          formOpen: false,
          auth: { token: 'injected-token' },
        },
        setManualKubeConfigId,
      },
    );

    const [updaterFn] = vi.mocked(clustersInfo.setClusters).mock.calls[0];
    const stored = updaterFn({});
    expect(stored['dev'].kubeconfig.users).toContainEqual(
      expect.objectContaining({
        user: expect.objectContaining({ token: 'injected-token' }),
      }),
    );

    expect(setManualKubeConfigId).toHaveBeenCalled();
    const [clearFn] = vi.mocked(setManualKubeConfigId).mock.calls[0];
    expect(
      clearFn({ formOpen: false, auth: { token: 'injected-token' } }),
    ).toMatchObject({ auth: null });
  });

  it('adds the cluster to the store without navigating when switchCluster is false', () => {
    const kubeconfig = makeKubeconfig();
    const clustersInfo = makeClustersInfo();

    addByContext(
      {
        kubeconfig,
        context: kubeconfig.contexts[0],
        storage: 'sessionStorage',
        switchCluster: false,
        config: {},
      },
      clustersInfo as any,
    );

    expect(clustersInfo.setClusters).toHaveBeenCalled();
    expect(clustersInfo.navigate).not.toHaveBeenCalled();
  });

  it('adopts an unnamed user with auth when no named user exists for the context', () => {
    const kubeconfig = makeKubeconfig({
      users: [{ name: '', user: { token: 'unnamed-token' } as any }],
    });
    const clustersInfo = makeClustersInfo();

    addByContext(
      {
        kubeconfig,
        context: kubeconfig.contexts[0],
        storage: 'sessionStorage',
        config: {},
      },
      clustersInfo as any,
    );

    expect(clustersInfo.setClusters).toHaveBeenCalled();
  });
});
