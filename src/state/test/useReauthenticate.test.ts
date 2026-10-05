import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { createElement, PropsWithChildren } from 'react';
import { UserManager } from 'oidc-client-ts';
import { getDefaultStore } from 'jotai';
import { getIntendedPath } from '../intendedPathAtom';
import { clusterAtom, CLUSTER_NAME_STORAGE_KEY } from '../clusterAtom';
import {
  AUTH_REDIRECT_STORAGE_KEY,
  isAuthRedirectLoop,
  registerAuthRedirect,
  resetReauthRedirectClaim,
} from '../utils/authRedirectLoopGuard';
import { useReauthenticate } from '../useReauthenticate';

const mockNavigate = vi.fn();

const { notifyLoginFailureMock } = vi.hoisted(() => ({
  notifyLoginFailureMock: vi.fn(),
}));

vi.mock('../useLoginFailureNotification', () => ({
  useNotifyLoginFailure: () => notifyLoginFailureMock,
}));

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function makeWrapper(initialPath: string) {
  // The hook reads the browser URL, which MemoryRouter does not touch.
  window.history.replaceState({}, '', initialPath);
  const Wrapper = ({ children }: PropsWithChildren) =>
    createElement(MemoryRouter, { initialEntries: [initialPath] }, children);
  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
}

function makeUserManager(overrides: Partial<UserManager> = {}) {
  return {
    clearStaleState: vi.fn().mockResolvedValue(undefined),
    signinRedirect: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as UserManager;
}

describe('useReauthenticate', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    notifyLoginFailureMock.mockReset();
    sessionStorage.clear();
    localStorage.clear();
    getDefaultStore().set(clusterAtom, null);
    resetReauthRedirectClaim();
  });

  it('redirects through the IdP and saves the intended path', async () => {
    const notifyError = vi.fn();
    const userManager = makeUserManager();
    const { result } = renderHook(() => useReauthenticate({ notifyError }), {
      wrapper: makeWrapper('/cluster/foo/namespaces/bar'),
    });

    await result.current(userManager);

    expect(userManager.clearStaleState).toHaveBeenCalled();
    expect(userManager.signinRedirect).toHaveBeenCalled();
    expect(getIntendedPath()?.path).toBe('/namespaces/bar');
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('counts its redirects towards the loop guard', async () => {
    const userManager = makeUserManager();
    const { result } = renderHook(() => useReauthenticate(), {
      wrapper: makeWrapper('/cluster/foo'),
    });

    await result.current(userManager); // simulated page load 1
    resetReauthRedirectClaim();
    await result.current(userManager); // simulated page load 2
    expect(isAuthRedirectLoop()).toBe(false);
    resetReauthRedirectClaim();
    await result.current(userManager); // simulated page load 3
    expect(isAuthRedirectLoop()).toBe(true);
  });

  it('saves the page open at expiry, not the one open when the callback was created', async () => {
    const userManager = makeUserManager();
    const { result } = renderHook(() => useReauthenticate(), {
      wrapper: makeWrapper('/cluster/foo/pods'),
    });
    const staleCallback = result.current;

    window.history.replaceState({}, '', '/cluster/foo/deployments?layout=x');
    await staleCallback(userManager);

    expect(getIntendedPath()?.path).toBe('/deployments?layout=x');
  });

  it('redirects only once when triggered twice in the same page load', async () => {
    const userManager = makeUserManager();
    const { result } = renderHook(() => useReauthenticate(), {
      wrapper: makeWrapper('/cluster/foo'),
    });

    await result.current(userManager);
    await result.current(userManager); // same load, no reset

    expect(userManager.signinRedirect).toHaveBeenCalledTimes(1);
    const stored = JSON.parse(
      sessionStorage.getItem(AUTH_REDIRECT_STORAGE_KEY) || '[]',
    );
    expect(stored).toHaveLength(1);
  });

  it('releases the claim after a failed redirect so a later attempt can retry', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const userManager = makeUserManager({
      signinRedirect: vi
        .fn()
        .mockRejectedValueOnce(new Error('idp down'))
        .mockResolvedValue(undefined),
    } as Partial<UserManager>);
    const { result } = renderHook(() => useReauthenticate(), {
      wrapper: makeWrapper('/cluster/foo/namespaces/bar'),
    });

    await result.current(userManager); // redirect rejects, claim released
    await result.current(userManager); // same load, redirects again

    expect(userManager.signinRedirect).toHaveBeenCalledTimes(2);
  });

  it('stops and reports a failure instead of redirecting again once a loop is detected', async () => {
    // A redirect loop is already in progress (API server keeps rejecting the token).
    registerAuthRedirect();
    registerAuthRedirect();
    registerAuthRedirect();
    expect(isAuthRedirectLoop()).toBe(true);

    const userManager = makeUserManager();
    const { result } = renderHook(() => useReauthenticate(), {
      wrapper: makeWrapper('/cluster/foo/namespaces/bar'),
    });

    await result.current(userManager);

    expect(userManager.signinRedirect).not.toHaveBeenCalled();
    expect(notifyLoginFailureMock).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/clusters');
  });

  it('recovery action saves intended path and uses prompt=login', async () => {
    // Pre-trip the guard.
    registerAuthRedirect();
    registerAuthRedirect();
    registerAuthRedirect();

    const userManager = makeUserManager();
    const { result } = renderHook(() => useReauthenticate(), {
      wrapper: makeWrapper('/cluster/foo/namespaces/bar'),
    });

    await result.current(userManager);

    expect(notifyLoginFailureMock).toHaveBeenCalled();
    const [, options] = notifyLoginFailureMock.mock.calls[0];
    expect(options.onRetry).toBeDefined();

    await options.onRetry();

    expect(userManager.signinRedirect).toHaveBeenCalledWith({
      prompt: 'login',
    });
    expect(getIntendedPath()?.path).toBe('/namespaces/bar');
  });

  it('recovery action re-persists the cluster so the callback can finish', async () => {
    getDefaultStore().set(clusterAtom, { name: 'foo' } as never);
    registerAuthRedirect();
    registerAuthRedirect();
    registerAuthRedirect();

    const userManager = makeUserManager();
    const { result } = renderHook(() => useReauthenticate(), {
      wrapper: makeWrapper('/cluster/foo/namespaces/bar'),
    });

    await result.current(userManager);
    // The loop branch cleared the cluster before showing the dialog.
    expect(localStorage.getItem(CLUSTER_NAME_STORAGE_KEY)).toBeNull();

    const [, options] = notifyLoginFailureMock.mock.calls[0];
    await options.onRetry();

    expect(localStorage.getItem(CLUSTER_NAME_STORAGE_KEY)).toBe('foo');
  });

  it('falls back to the cluster list when no UserManager is available', async () => {
    const notifyError = vi.fn();
    const { result } = renderHook(() => useReauthenticate({ notifyError }), {
      wrapper: makeWrapper('/cluster/foo/namespaces/bar'),
    });

    await result.current(null, new Error('token revoked'));

    expect(mockNavigate).toHaveBeenCalledWith('/clusters');
    expect(getIntendedPath()).toBeNull();
    expect(notifyError).toHaveBeenCalledWith({
      content: expect.stringContaining('token revoked'),
    });
  });

  it('falls back and clears the intended path when the IdP redirect fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const notifyError = vi.fn();
    const userManager = makeUserManager({
      signinRedirect: vi.fn().mockRejectedValue(new Error('idp down')),
    } as Partial<UserManager>);
    const { result } = renderHook(() => useReauthenticate({ notifyError }), {
      wrapper: makeWrapper('/cluster/foo/namespaces/bar'),
    });

    await result.current(userManager);

    expect(getIntendedPath()).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/clusters');
    expect(notifyError).toHaveBeenCalled();
  });
});
