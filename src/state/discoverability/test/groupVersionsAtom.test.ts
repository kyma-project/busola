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

const withGroups = (groups: any[]) =>
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
    withGroups([]);

    const result = await store.get(groupVersionsAtom);

    expect(result).toEqual(['v1']);
  });

  it('includes core group "v1" as the first entry', async () => {
    withGroups([
      {
        name: 'apps',
        preferredVersion: { groupVersion: 'apps/v1', version: 'v1' },
        versions: [{ groupVersion: 'apps/v1', version: 'v1' }],
      },
    ]);

    const result = await store.get(groupVersionsAtom);

    expect(result![0]).toBe('v1');
  });

  it('flattens all versions from all API groups', async () => {
    withGroups([
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
    ]);

    const result = await store.get(groupVersionsAtom);

    expect(result).toEqual(['v1', 'apps/v1', 'batch/v1', 'batch/v1beta1']);
  });

  it('uses groupVersion field (not version) from each version entry', async () => {
    withGroups([
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

    expect(result).toContain('networking.k8s.io/v1');
    expect(result).toContain('networking.k8s.io/v1beta1');
    expect(result).not.toContain('v1beta1');
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

    const unsub = store.sub(groupVersionsAtomSync, () => {});
    const result = store.get(groupVersionsAtomSync);
    unsub();

    expect(result).toBeNull();
  });

  it('returns resolved group versions once the async atom settles', async () => {
    withGroups([
      {
        name: 'apps',
        preferredVersion: { groupVersion: 'apps/v1', version: 'v1' },
        versions: [{ groupVersion: 'apps/v1', version: 'v1' }],
      },
    ]);

    const resolved = await new Promise<string[] | null>((resolve) => {
      const unsub = store.sub(groupVersionsAtomSync, () => {
        const val = store.get(groupVersionsAtomSync);
        if (val !== null) {
          unsub();
          resolve(val);
        }
      });
    });

    expect(resolved).toEqual(['v1', 'apps/v1']);
  });

  it('returns resolved versions with multiple API groups', async () => {
    withGroups([
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
    ]);

    const resolved = await new Promise<string[] | null>((resolve) => {
      const unsub = store.sub(groupVersionsAtomSync, () => {
        const val = store.get(groupVersionsAtomSync);
        if (val !== null) {
          unsub();
          resolve(val);
        }
      });
    });

    expect(resolved).toEqual(['v1', 'apps/v1', 'batch/v1', 'batch/v1beta1']);
  });
});
