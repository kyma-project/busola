import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { createElement, PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router';
import { Provider, createStore } from 'jotai';
import { configurationAtom } from 'state/configuration/configurationAtom';
import { ssoDataAtom } from 'state/ssoDataAtom';
import { useLoginWithKubeconfigID } from './useLoginWithKubeconfigID';

const KUBECONFIG = `
apiVersion: v1
kind: Config
current-context: foo
clusters:
  - name: foo
    cluster: { server: https://example.com }
users:
  - name: foo-user
    user: { token: abc }
contexts:
  - name: foo
    context: { cluster: foo, user: foo-user }
`;

function makeWrapper(ssoEnabled: boolean) {
  const store = createStore();
  store.set(configurationAtom, {
    features: {
      SSO_LOGIN: { isEnabled: ssoEnabled },
      KUBECONFIG_ID: {
        isEnabled: true,
        config: { kubeconfigUrl: '/kubeconfig' },
      },
    },
  } as never);
  store.set(ssoDataAtom, null);
  const Wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      MemoryRouter,
      { initialEntries: ['/?kubeconfigID=abc'] },
      createElement(Provider, { store }, children),
    );
  Wrapper.displayName = 'TestWrapper';
  return { Wrapper, store };
}

describe('useLoginWithKubeconfigID with SSO login', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    fetchMock.mockReset();
    fetchMock.mockResolvedValue({ text: async () => KUBECONFIG });
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('waits for the SSO login before loading the kubeconfig', async () => {
    const { Wrapper, store } = makeWrapper(true);
    const { result } = renderHook(() => useLoginWithKubeconfigID(), {
      wrapper: Wrapper,
    });

    // Loading it now would drop the kubeconfigID before the SSO redirect saves it.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current).not.toBe('done');

    act(() => store.set(ssoDataAtom, { id_token: 'jwt' } as never));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith('/kubeconfig/abc'),
    );
    await waitFor(() => expect(result.current).toBe('done'));
  });

  it('loads the kubeconfig right away when SSO login is disabled', async () => {
    const { Wrapper } = makeWrapper(false);
    renderHook(() => useLoginWithKubeconfigID(), { wrapper: Wrapper });

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith('/kubeconfig/abc'),
    );
  });
});
