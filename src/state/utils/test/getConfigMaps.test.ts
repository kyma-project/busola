import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGetPermissionResourceRules = vi.fn();
const mockDoesUserHavePermission = vi.fn();

vi.mock('state/permissionSetsAtom', () => ({
  getPermissionResourceRules: mockGetPermissionResourceRules,
}));

vi.mock('state/navigation/filters/permissions', () => ({
  doesUserHavePermission: mockDoesUserHavePermission,
}));

vi.mock('shared/hooks/BackendAPI/usePost', () => ({
  createPostFn: vi.fn().mockReturnValue(vi.fn()),
}));

// Static import — mocks above are hoisted and in place before this resolves
const { getConfigMaps } = await import('../getConfigMaps');

function makeJsonResponse(data: unknown) {
  return { json: () => Promise.resolve(data) };
}

function makeFetchFn(response: unknown) {
  return vi.fn().mockResolvedValue(makeJsonResponse(response));
}

describe('getConfigMaps', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when fetchFn is undefined', async () => {
    const result = await getConfigMaps(
      undefined,
      'kube-public',
      'default',
      [],
      'app=busola',
    );
    expect(result).toBeNull();
  });

  it('uses cluster-wide URL when user has cluster access', async () => {
    const items = [{ metadata: { name: 'cm-1' }, data: { key: 'val' } }];
    const fetchFn = makeFetchFn({ items });
    // namespace check: has access; cluster check: has access
    mockDoesUserHavePermission
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true);
    mockGetPermissionResourceRules.mockResolvedValue([]);

    const result = await getConfigMaps(
      fetchFn,
      'kube-public',
      'default',
      [],
      'app=busola',
    );

    expect(fetchFn).toHaveBeenCalledWith({
      relativeUrl: '/api/v1/configmaps?labelSelector=app=busola',
    });
    expect(result).toEqual(items);
  });

  it('falls back to namespaced URL when cluster access is denied but namespace access is granted', async () => {
    const items = [{ metadata: { name: 'cm-ns' }, data: {} }];
    const fetchFn = makeFetchFn({ items });
    // namespace check: has access; cluster check: no access
    mockDoesUserHavePermission
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    mockGetPermissionResourceRules.mockResolvedValue([]);

    const result = await getConfigMaps(
      fetchFn,
      'kube-public',
      'my-namespace',
      [],
      'type=config',
    );

    expect(fetchFn).toHaveBeenCalledWith({
      relativeUrl:
        '/api/v1/namespaces/my-namespace/configmaps?labelSelector=type=config',
    });
    expect(result).toEqual(items);
  });

  it('uses empty URL and returns empty array when user has no access at all', async () => {
    const fetchFn = makeFetchFn({ items: [] });
    // namespace check: no access; cluster check: no access
    mockDoesUserHavePermission.mockReturnValue(false);
    mockGetPermissionResourceRules.mockResolvedValue([]);

    const result = await getConfigMaps(
      fetchFn,
      'kube-public',
      'default',
      [],
      'app=busola',
    );

    expect(fetchFn).toHaveBeenCalledWith({ relativeUrl: '' });
    expect(result).toEqual([]);
  });

  it('uses kubeconfigNamespace when currentNamespace is null', async () => {
    const fetchFn = makeFetchFn({ items: [] });
    // namespace check: has access; cluster check: no access → namespaced URL
    mockDoesUserHavePermission
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    mockGetPermissionResourceRules.mockResolvedValue([]);

    // null is valid at runtime even though the type says string
    await getConfigMaps(
      fetchFn,
      'kube-public',
      null as unknown as string,
      [],
      'x=y',
    );

    expect(fetchFn).toHaveBeenCalledWith({
      relativeUrl:
        '/api/v1/namespaces/kube-public/configmaps?labelSelector=x=y',
    });
  });

  it('returns empty array and warns on fetch error', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('network failure'));
    mockDoesUserHavePermission.mockReturnValue(true);
    mockGetPermissionResourceRules.mockResolvedValue([]);
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await getConfigMaps(
      fetchFn,
      'kube-public',
      'default',
      [],
      'app=x',
    );

    expect(result).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(
      'Cannot load cluster params from the target cluster: ',
      expect.any(Error),
    );
    warnSpy.mockRestore();
  });

  it('returns empty array when response has no items field', async () => {
    const fetchFn = makeFetchFn(undefined);
    mockDoesUserHavePermission.mockReturnValue(true);
    mockGetPermissionResourceRules.mockResolvedValue([]);

    const result = await getConfigMaps(
      fetchFn,
      'kube-public',
      'default',
      [],
      'app=x',
    );

    expect(result).toEqual([]);
  });
});
