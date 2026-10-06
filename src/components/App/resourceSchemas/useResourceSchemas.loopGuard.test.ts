import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, PropsWithChildren } from 'react';
import { MemoryRouter } from 'react-router';
import { Provider, createStore } from 'jotai';
import { authDataAtom } from 'state/authDataAtom';
import { clusterAtom } from 'state/clusterAtom';
import { configurationAtom } from 'state/configuration/configurationAtom';
import {
  isAuthRedirectLoop,
  registerAuthRedirect,
} from 'state/utils/authRedirectLoopGuard';
import { useResourceSchemas } from './useResourceSchemas';

vi.mock('./resourceSchemaWorkerApi', () => ({
  addWorkerErrorListener: vi.fn(),
  addWorkerListener: vi.fn(),
  sendWorkerMessage: vi.fn(),
  terminateWorker: vi.fn(),
}));

vi.mock('hooks/useUrl', () => ({ useUrl: () => ({ cluster: 'foo' }) }));

vi.mock('state/utils/getClustersInfo', () => ({
  useClustersInfo: () => ({ currentCluster: null }),
}));

vi.mock('state/useLoginFailureNotification', () => ({
  useNotifyLoginFailure: () => vi.fn(),
}));

// openapiAtom is a loadable derived atom, use a plain atom so we can set state.
vi.mock('state/openapi/openapiAtom', async () => {
  const { atom: jotaiAtom } = await import('jotai');
  return { openapiAtom: jotaiAtom<any>({ state: 'hasData', data: {} }) };
});

function makeWrapper() {
  const store = createStore();
  store.set(configurationAtom, {
    features: { SSO_LOGIN: { isEnabled: false } },
  } as any);
  store.set(authDataAtom, { token: 'jwt' } as any);
  store.set(clusterAtom, { name: 'foo', contextName: 'foo' } as any);
  const Wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      MemoryRouter,
      { initialEntries: ['/cluster/foo'] },
      createElement(Provider, { store }, children),
    );
  Wrapper.displayName = 'TestWrapper';
  return { Wrapper };
}

describe('useResourceSchemas redirect-loop guard', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('clears the redirect-loop guard once the session is proven usable', async () => {
    // Several redirects already happened from earlier reauth attempts.
    registerAuthRedirect();
    registerAuthRedirect();
    registerAuthRedirect();
    expect(isAuthRedirectLoop()).toBe(true);

    const { Wrapper } = makeWrapper();
    renderHook(() => useResourceSchemas(), { wrapper: Wrapper });

    // A working session (schema fetched) should clear the loop count.
    await waitFor(() => expect(isAuthRedirectLoop()).toBe(false));
  });
});
