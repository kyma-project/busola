import { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createStore, Provider } from 'jotai';

const mocks = vi.hoisted(() => ({ post: vi.fn() }));

vi.mock('shared/hooks/BackendAPI/usePost', () => ({
  usePost: () => mocks.post,
}));
vi.mock('state/clusterAtom', async () => {
  const { atom } = await import('jotai');
  return { clusterAtom: atom<unknown>(null) };
});
vi.mock('state/authDataAtom', async () => {
  const { atom } = await import('jotai');
  return { authDataAtom: atom<unknown>(null) };
});

import { clusterAtom } from 'state/clusterAtom';
import { authDataAtom } from 'state/authDataAtom';
import { ColumnState, columnLayoutAtom } from 'state/columnLayoutAtom';
import { sessionIDAtom } from 'state/companion/sessionIDAtom';
import { usePromptSuggestions } from './usePromptSuggestions';

const activeCluster = {
  currentContext: {
    cluster: {
      cluster: {
        server: 'https://api.cluster.example',
        'certificate-authority-data': 'ca-data',
      },
    },
  },
} as any;

const column = (overrides: Partial<ColumnState>): ColumnState => ({
  resourceName: null,
  resourceType: null,
  ...overrides,
});

const layout = (columns: {
  startColumn?: ColumnState;
  midColumn?: ColumnState;
  endColumn?: ColumnState;
}) => ({
  layout: 'OneColumn' as const,
  startColumn: null,
  midColumn: null,
  endColumn: null,
  ...columns,
});

const podsList = layout({
  startColumn: column({ resourceType: 'pods', apiVersion: 'v1' }),
});

const setIsReset = vi.fn();

const setup = ({
  columnLayout = podsList,
  isReset = false,
  skip = false,
} = {}) => {
  const store = createStore();
  store.set(clusterAtom, activeCluster);
  store.set(authDataAtom, { token: 'cluster-token' } as any);
  store.set(columnLayoutAtom, columnLayout);
  const view = renderHook(
    (props: { isReset: boolean }) =>
      usePromptSuggestions(props.isReset, setIsReset, { skip }),
    {
      initialProps: { isReset },
      wrapper: ({ children }: { children: ReactNode }) => (
        <Provider store={store}>{children}</Provider>
      ),
    },
  );
  return { store, ...view };
};

const sentPayload = (call = 0) => mocks.post.mock.calls[call][1];

describe('usePromptSuggestions', () => {
  beforeEach(() => {
    mocks.post.mockReset();
    mocks.post.mockResolvedValue({
      promptSuggestions: ['What is wrong?'],
      conversationId: 'conversation-1',
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads suggestions for the current resource and stores the session id', async () => {
    const { result, store } = setup();

    await waitFor(() =>
      expect(result.current.initialSuggestionsLoading).toBe(false),
    );

    expect(result.current.initialSuggestions).toEqual(['What is wrong?']);
    expect(result.current.currentResource).toEqual({
      namespace: '',
      resourceType: 'Pod',
      groupVersion: 'v1',
      resourceName: '',
    });
    expect(store.get(sessionIDAtom)).toBe('conversation-1');
    expect(mocks.post).toHaveBeenCalledTimes(1);
    expect(mocks.post).toHaveBeenCalledWith('/ai-chat/suggestions', {
      namespace: '',
      resourceType: 'Pod',
      groupVersion: 'v1',
      resourceName: '',
      clusterUrl: 'https://api.cluster.example',
      certificateAuthorityData: 'ca-data',
      clusterToken: 'cluster-token',
      clientCertificateData: undefined,
      clientKeyData: undefined,
    });
  });

  it('uses the innermost open column as the current resource', async () => {
    setup({
      columnLayout: layout({
        startColumn: column({ resourceType: 'namespaces', apiVersion: 'v1' }),
        midColumn: column({
          resourceType: 'deployments',
          apiGroup: 'apps',
          apiVersion: 'v1',
          namespaceId: 'default',
        }),
        endColumn: column({
          resourceType: 'horizontalpodautoscalers',
          rawResourceTypeName: 'HorizontalPodAutoscalers',
          resourceName: 'my-hpa',
          apiGroup: 'autoscaling',
          apiVersion: 'v2',
          namespaceId: 'default',
        }),
      }),
    });

    await waitFor(() => expect(mocks.post).toHaveBeenCalledTimes(1));
    expect(sentPayload()).toMatchObject({
      namespace: 'default',
      resourceType: 'HorizontalPodAutoscaler',
      groupVersion: 'autoscaling/v2',
      resourceName: 'my-hpa',
    });
  });

  it('falls back to the middle column when no end column is open', async () => {
    setup({
      columnLayout: layout({
        startColumn: column({ resourceType: 'namespaces', apiVersion: 'v1' }),
        midColumn: column({
          resourceType: 'deployments',
          resourceName: 'my-app',
          apiGroup: 'apps',
          apiVersion: 'v1',
          namespaceId: 'default',
        }),
      }),
    });

    await waitFor(() => expect(mocks.post).toHaveBeenCalledTimes(1));
    expect(sentPayload()).toMatchObject({
      namespace: 'default',
      resourceType: 'Deployment',
      groupVersion: 'apps/v1',
      resourceName: 'my-app',
    });
  });

  it('does not request suggestions when no resource is open', async () => {
    const { result } = setup({ columnLayout: layout({}) });

    await waitFor(() =>
      expect(result.current.currentResource.resourceType).toBe(''),
    );
    expect(mocks.post).not.toHaveBeenCalled();
    expect(setIsReset).not.toHaveBeenCalled();
  });

  it('does not request suggestions when skipped', async () => {
    const { result } = setup({ skip: true });

    await waitFor(() =>
      expect(result.current.currentResource.resourceType).toBe('Pod'),
    );
    expect(mocks.post).not.toHaveBeenCalled();
  });

  it('requests suggestions only once for the same resource', async () => {
    const { result, rerender } = setup();
    await waitFor(() =>
      expect(result.current.initialSuggestionsLoading).toBe(false),
    );

    rerender({ isReset: false });

    expect(mocks.post).toHaveBeenCalledTimes(1);
  });

  it('requests suggestions again after a reset and clears the reset flag', async () => {
    const { result, rerender } = setup();
    await waitFor(() =>
      expect(result.current.initialSuggestionsLoading).toBe(false),
    );
    setIsReset.mockClear();
    mocks.post.mockResolvedValue({
      promptSuggestions: ['Anything new?'],
      conversationId: 'conversation-2',
    });

    rerender({ isReset: true });

    await waitFor(() =>
      expect(result.current.initialSuggestions).toEqual(['Anything new?']),
    );
    expect(mocks.post).toHaveBeenCalledTimes(2);
    expect(setIsReset).toHaveBeenCalledWith(false);
  });

  it('requests suggestions again when another resource is opened', async () => {
    const { result, store } = setup();
    await waitFor(() =>
      expect(result.current.initialSuggestionsLoading).toBe(false),
    );

    store.set(
      columnLayoutAtom,
      layout({
        startColumn: column({ resourceType: 'pods', apiVersion: 'v1' }),
        midColumn: column({
          resourceType: 'pods',
          resourceName: 'my-pod',
          apiVersion: 'v1',
          namespaceId: 'default',
        }),
      }),
    );

    await waitFor(() => expect(mocks.post).toHaveBeenCalledTimes(2));
    expect(sentPayload(1)).toMatchObject({
      namespace: 'default',
      resourceType: 'Pod',
      resourceName: 'my-pod',
    });
  });

  it('leaves the suggestions empty when the backend returns none', async () => {
    mocks.post.mockResolvedValue({ unexpected: true });

    const { result, store } = setup();

    await waitFor(() =>
      expect(result.current.initialSuggestionsLoading).toBe(false),
    );
    expect(result.current.initialSuggestions).toEqual([]);
    expect(store.get(sessionIDAtom)).toBe('');
  });

  it('stops loading when the request fails', async () => {
    mocks.post.mockRejectedValue(new Error('Network error'));

    const { result } = setup();

    await waitFor(() =>
      expect(result.current.initialSuggestionsLoading).toBe(false),
    );
    expect(result.current.initialSuggestions).toEqual([]);
  });
});
