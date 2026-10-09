import { describe, it, expect } from 'vitest';
import { isGardenloginKubeconfig, extractShootRef } from '../gardenlogin';

const base = {
  'current-context': 'shoot-external',
  contexts: [
    {
      name: 'shoot-external',
      context: { cluster: 'shoot-external', user: 'u' },
    },
  ],
  clusters: [
    {
      name: 'shoot-external',
      cluster: {
        server: 'https://api.shoot.example',
        extensions: [
          {
            name: 'client.authentication.k8s.io/exec',
            extension: {
              shootRef: { namespace: 'garden-proj', name: 'myshoot' },
              gardenClusterIdentity: 'landscape-x',
            },
          },
        ],
      },
    },
  ],
} as any;

const withUser = (user: any) =>
  ({ ...base, users: [{ name: 'u', user }] }) as any;

describe('isGardenloginKubeconfig', () => {
  it('matches command kubectl-gardenlogin', () => {
    expect(
      isGardenloginKubeconfig(
        withUser({
          exec: {
            command: 'kubectl-gardenlogin',
            args: ['get-client-certificate'],
          },
        }),
      ),
    ).toBe(true);
  });
  it('matches canonical command kubectl + gardenlogin arg', () => {
    expect(
      isGardenloginKubeconfig(
        withUser({
          exec: {
            command: 'kubectl',
            args: ['gardenlogin', 'get-client-certificate'],
          },
        }),
      ),
    ).toBe(true);
  });
  it('does not match an oidc-login exec', () => {
    expect(
      isGardenloginKubeconfig(
        withUser({
          exec: { command: 'kubectl', args: ['oidc-login', 'get-token'] },
        }),
      ),
    ).toBe(false);
  });
  it('does not match a static-token user', () => {
    expect(isGardenloginKubeconfig(withUser({ token: 'abc' }))).toBe(false);
  });
  it('handles undefined', () => {
    expect(isGardenloginKubeconfig(undefined)).toBe(false);
  });
});

describe('extractShootRef', () => {
  it('reads shootRef + identity from the current-context cluster extension', () => {
    expect(
      extractShootRef(
        withUser({
          exec: {
            command: 'kubectl-gardenlogin',
            args: ['get-client-certificate'],
          },
        }),
      ),
    ).toEqual({
      namespace: 'garden-proj',
      name: 'myshoot',
      gardenClusterIdentity: 'landscape-x',
    });
  });
  it('returns null when no exec extension is present', () => {
    const noExt = {
      ...base,
      clusters: [{ name: 'shoot-external', cluster: { server: 'x' } }],
      users: [{ name: 'u', user: {} }],
    } as any;
    expect(extractShootRef(noExt)).toBeNull();
  });
});
