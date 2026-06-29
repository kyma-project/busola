import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStore } from 'jotai';
import { apiGroupAtom } from '../apiGroupsAtom';

vi.mock('state/utils/getFetchFn', () => ({
  getFetchFn: vi.fn(),
}));

import { getFetchFn } from 'state/utils/getFetchFn';

const mockApiGroups = [
  {
    name: 'apps',
    preferredVersion: { groupVersion: 'apps/v1', version: 'v1' },
    versions: [{ groupVersion: 'apps/v1', version: 'v1' }],
  },
  {
    name: 'batch',
    preferredVersion: { groupVersion: 'batch/v1', version: 'v1' },
    versions: [
      { groupVersion: 'batch/v1', version: 'v1' },
      { groupVersion: 'batch/v1beta1', version: 'v1beta1' },
    ],
  },
];

describe('apiGroupAtom', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    vi.clearAllMocks();
  });

  it('returns null when no fetch function is available (no auth/cluster)', async () => {
    vi.mocked(getFetchFn).mockReturnValue(undefined);

    const result = await store.get(apiGroupAtom);

    expect(result).toBeNull();
  });

  it('returns API groups on successful fetch', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ groups: mockApiGroups }),
    });
    vi.mocked(getFetchFn).mockReturnValue(mockFetch as any);

    const result = await store.get(apiGroupAtom);

    expect(result).toEqual(mockApiGroups);
    expect(mockFetch).toHaveBeenCalledWith({ relativeUrl: '/apis' });
  });

  it('returns null and logs warning when fetch throws', async () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.mocked(getFetchFn).mockReturnValue(mockFetch as any);

    const result = await store.get(apiGroupAtom);

    expect(result).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to fetch API groups:',
      expect.any(Error),
    );
    consoleWarnSpy.mockRestore();
  });

  it('returns null and logs warning when response.json() throws', async () => {
    const consoleWarnSpy = vi
      .spyOn(console, 'warn')
      .mockImplementation(() => {});
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.reject(new Error('Parse error')),
    });
    vi.mocked(getFetchFn).mockReturnValue(mockFetch as any);

    const result = await store.get(apiGroupAtom);

    expect(result).toBeNull();
    expect(consoleWarnSpy).toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });

  it('returns an empty array when the API responds with no groups', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ groups: [] }),
    });
    vi.mocked(getFetchFn).mockReturnValue(mockFetch as any);

    const result = await store.get(apiGroupAtom);

    expect(result).toEqual([]);
  });
});
