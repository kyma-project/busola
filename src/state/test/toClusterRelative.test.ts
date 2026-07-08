import { describe, it, expect } from 'vitest';
import { toClusterRelative } from '../intendedPathAtom';

describe('toClusterRelative', () => {
  it('strips the /cluster/<name> prefix for nested paths', () => {
    expect(toClusterRelative('/cluster/foo/namespaces/bar')).toBe(
      '/namespaces/bar',
    );
  });

  it('preserves query strings', () => {
    expect(toClusterRelative('/cluster/foo/deployments?layout=list')).toBe(
      '/deployments?layout=list',
    );
  });

  it('returns "/" for a bare /cluster/<name>', () => {
    // Guard against /cluster/foo/cluster/foo restore on the bare URL.
    expect(toClusterRelative('/cluster/foo')).toBe('/');
  });

  it('returns null when the path is not under /cluster/', () => {
    expect(toClusterRelative('/clusters')).toBeNull();
    expect(toClusterRelative('/gardener-login')).toBeNull();
    expect(toClusterRelative('/kubeconfig')).toBeNull();
  });

  it('URL-decoded cluster names with dashes and dots still get stripped', () => {
    expect(toClusterRelative('/cluster/my.cluster-1/pods')).toBe('/pods');
  });
});
