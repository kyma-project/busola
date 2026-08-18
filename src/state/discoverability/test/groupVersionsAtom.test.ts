import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createStore } from 'jotai';

vi.mock('state/utils/getFetchFn', () => ({
  getFetchFn: vi.fn(),
}));

import { getFetchFn } from 'state/utils/getFetchFn';
import { groupVersionsAtom, groupVersionsAtomSync } from '../groupVersionsAtom';

const makeFetchReturning = (groups: any[]) =>
  vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ groups }),
  });

const noAuthFetch = () => vi.mocked(getFetchFn).mockReturnValue(undefined);

const mockFetchFn = (groups: any[]) =>
  vi.mocked(getFetchFn).mockReturnValue(makeFetchReturning(groups) as any);

describe('groupVersionsAtom', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    vi.clearAllMocks();
  });

  it('returns null when apiGroupAtom resolves to null (no auth)', async () => {
    noAuthFetch();

    const result = await store.get(groupVersionsAtom);

    expect(result).toBeNull();
  });

  it('returns only the core group when API groups list is empty', async () => {
    mockFetchFn([]);

    const result = await store.get(groupVersionsAtom);

    expect(result).toEqual(['v1']);
  });

  it('includes core group "v1" as the first entry', async () => {
    mockFetchFn([
      {
        name: 'apps',
        preferredVersion: { groupVersion: 'apps/v1', version: 'v1' },
        versions: [{ groupVersion: 'apps/v1', version: 'v1' }],
      },
    ]);

    const result = await store.get(groupVersionsAtom);

    expect(result![0]).toBe('v1');
  });

  it('flattens all groupVersion strings from all API groups', async () => {
    mockFetchFn([
      {
        name: 'networking.k8s.io',
        preferredVersion: {
          groupVersion: 'networking.k8s.io/v1',
          version: 'v1',
        },
        versions: [
          { groupVersion: 'networking.k8s.io/v1', version: 'v1' },
          { groupVersion: 'networking.k8s.io/v1beta1', version: 'v1beta1' },
        ],
      },
    ]);

    const result = await store.get(groupVersionsAtom);

    expect(result).toEqual([
      'v1',
      'networking.k8s.io/v1',
      'networking.k8s.io/v1beta1',
    ]);
  });
});

describe('groupVersionsAtomSync', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    vi.clearAllMocks();
  });

  it('returns null synchronously before the async atom resolves', () => {
    vi.mocked(getFetchFn).mockReturnValue(
      vi.fn().mockReturnValue(new Promise(() => {})) as any,
    );

    const result = store.get(groupVersionsAtomSync);

    expect(result).toBeNull();
  });

  it('returns resolved group versions once the async atom settles', async () => {
    mockFetchFn([
      {
        name: 'apps',
        preferredVersion: { groupVersion: 'apps/v1', version: 'v1' },
        versions: [{ groupVersion: 'apps/v1', version: 'v1' }],
      },
    ]);

    const unsub = store.sub(groupVersionsAtomSync, () => {});
    await store.get(groupVersionsAtom);
    const resolved = store.get(groupVersionsAtomSync);
    unsub();

    expect(resolved).toEqual(['v1', 'apps/v1']);
  });
});
