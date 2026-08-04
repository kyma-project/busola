import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { createElement, PropsWithChildren } from 'react';
import { UserManager } from 'oidc-client-ts';
import { getIntendedPath } from '../intendedPathAtom';
import { useReauthenticate } from '../useReauthenticate';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual =
    await vi.importActual<typeof import('react-router')>('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function makeWrapper(initialPath: string) {
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
    sessionStorage.clear();
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
