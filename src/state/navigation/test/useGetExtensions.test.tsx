import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import type { ReactNode } from 'react';
import { extensionsAtom, useGetExtensions } from '../extensionsAtom';
import type { PermissionSetState } from 'state/permissionSetsAtom';

const atoms = await vi.hoisted(async () => {
  const { atom } = await import('jotai');
  return {
    cluster: atom<any>(null),
    auth: atom<any>(null),
    permissions: atom<PermissionSetState | Promise<PermissionSetState>>([]),
    configuration: atom<any>({ features: {} }),
    resourcePaths: atom<string[]>([]),
    crds: atom<any>(null),
    refresh: atom(0),
  };
});

const fetchMock = vi.fn();
const getPermissionResourceRulesMock = vi.fn();

vi.mock('state/clusterAtom', () => ({ clusterAtom: atoms.cluster }));
vi.mock('state/authDataAtom', () => ({ authDataAtom: atoms.auth }));
vi.mock('state/refreshExtenshionsAtom', () => ({
  refreshExtenshionsAtom: atoms.refresh,
}));
vi.mock('state/configuration/configurationAtom', () => ({
  configurationAtom: atoms.configuration,
}));
vi.mock('state/discoverability/resourcePathsAtom', () => ({
  resourcePathsAtom: atoms.resourcePaths,
}));
vi.mock('state/permissionSetsAtom', () => ({
  permissionSetsAtom: atoms.permissions,
  getPermissionResourceRules: (...args: unknown[]) =>
    getPermissionResourceRulesMock(...args),
}));
vi.mock('state/utils/getFetchFn', () => ({
  getFetchFn: (get: (a: unknown) => unknown) =>
    get(atoms.auth) ? fetchMock : undefined,
}));
vi.mock('shared/hooks/BackendAPI/useGet', async () => {
  const { useAtomValue } = await import('jotai');
  return { useGet: () => ({ data: useAtomValue(atoms.crds) }) };
});
vi.mock('hooks/useUrl', () => ({ useUrl: () => ({ namespace: undefined }) }));
vi.mock('hooks/useFeature', () => ({
  useFeature: () => ({ isEnabled: false }),
}));
vi.mock('shared/utils/env', () => ({ getConfigDir: async () => '' }));

const allRules: PermissionSetState = [
  { apiGroups: ['*'], resources: ['*'], verbs: ['*'] },
];
const pizzaPath = '/apis/busola.example.com/v1/pizzas';
const pizzaExtension = {
  metadata: { name: 'pizzas', namespace: 'kube-public' },
  data: {
    general: [
      'name: Pizzas',
      'urlPath: pizzas',
      'scope: cluster',
      'resource:',
      '  kind: Pizza',
      '  group: busola.example.com',
      '  version: v1',
    ].join('\n'),
  },
};

const listCalls = () =>
  fetchMock.mock.calls.filter(([{ relativeUrl }]) =>
    relativeUrl.includes('/configmaps?labelSelector=busola.io/extension='),
  ).length;

const renderWithStore = () => {
  const store = createStore();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  store.set(atoms.cluster, { currentContext: { namespace: 'default' } });
  renderHook(() => useGetExtensions(), { wrapper });
  return store;
};

describe('useGetExtensions', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('')),
    );
    fetchMock.mockReset();
    fetchMock.mockImplementation(async ({ relativeUrl }) =>
      Response.json({
        items: relativeUrl.includes('busola.io/extension=resource')
          ? [pizzaExtension]
          : [],
      }),
    );
    getPermissionResourceRulesMock.mockReset();
    getPermissionResourceRulesMock.mockResolvedValue(allRules);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads the extension ConfigMaps once while OpenAPI paths, CRDs and features arrive', async () => {
    const store = renderWithStore();
    act(() => {
      store.set(atoms.auth, { token: 'token' });
      store.set(atoms.permissions, allRules);
    });
    await waitFor(() => expect(store.get(extensionsAtom)).toEqual([]));

    act(() => store.set(atoms.resourcePaths, [pizzaPath]));
    await waitFor(() =>
      expect(store.get(extensionsAtom)?.[0]?.general?.name).toBe('Pizzas'),
    );
    act(() => {
      store.set(atoms.crds, { items: [] });
      store.set(atoms.configuration, { features: {} });
    });
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    expect(listCalls()).toBe(3);
    expect(getPermissionResourceRulesMock).toHaveBeenCalledTimes(1);
    expect(store.get(extensionsAtom)?.[0]?.general?.name).toBe('Pizzas');
  });

  it('waits for the permissions of a new login instead of loading with the old ones', async () => {
    const store = renderWithStore();
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    let resolvePermissions: (rules: PermissionSetState) => void = () => {};
    act(() => {
      store.set(atoms.auth, { token: 'token' });
      store.set(
        atoms.permissions,
        new Promise<PermissionSetState>((resolve) => {
          resolvePermissions = resolve;
        }),
      );
    });
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    expect(listCalls()).toBe(0);

    await act(async () => resolvePermissions(allRules));
    await waitFor(() => expect(store.get(extensionsAtom)).not.toBeNull());
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    expect(listCalls()).toBe(3);
  });
});
