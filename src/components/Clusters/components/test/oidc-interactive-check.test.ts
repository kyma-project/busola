import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import {
  isOidcInteractive,
  useNonInteractiveOidcContexts,
} from '../oidc-interactive-check';

// Each test uses a unique URL so the module-level discoveryCache never cross-contaminates tests.
let urlCounter = 0;
const freshUrl = () => `https://oidc-test-${++urlCounter}.example.com`;

function mockFetch(body: object, ok = true) {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({ ok, json: () => Promise.resolve(body) }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isOidcInteractive', () => {
  it('returns true when grant_types_supported includes authorization_code', async () => {
    mockFetch({
      grant_types_supported: ['authorization_code', 'client_credentials'],
    });
    expect(await isOidcInteractive(freshUrl())).toBe(true);
  });

  it('returns true when response_types_supported includes code', async () => {
    mockFetch({ response_types_supported: ['code', 'id_token'] });
    expect(await isOidcInteractive(freshUrl())).toBe(true);
  });

  it('returns false for GHA-like provider with only id_token response type', async () => {
    mockFetch({ response_types_supported: ['id_token'] });
    expect(await isOidcInteractive(freshUrl())).toBe(false);
  });

  it('returns true (fail-open) when fetch throws a network/CORS error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('CORS')));
    expect(await isOidcInteractive(freshUrl())).toBe(true);
  });

  it('returns true (fail-open) when discovery endpoint returns non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    expect(await isOidcInteractive(freshUrl())).toBe(true);
  });

  it('returns cached result and does not re-fetch on second call', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ response_types_supported: ['id_token'] }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const url = freshUrl();
    await isOidcInteractive(url);
    await isOidcInteractive(url);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('useNonInteractiveOidcContexts', () => {
  it('marks context as non-interactive when exec has interactiveMode Never', async () => {
    // No fetch needed — interactiveMode: "Never" is detected before the network call
    const contexts = [
      { name: 'gha-ctx', context: { cluster: 'c', user: 'gha-user' } },
    ];
    const users = [
      {
        name: 'gha-user',
        user: {
          exec: {
            command: 'bash',
            args: ['-c', 'echo token'],
            interactiveMode: 'Never' as const,
          },
        },
      },
    ];
    const { result } = renderHook(() =>
      useNonInteractiveOidcContexts(contexts, users as any),
    );
    await waitFor(() => expect(result.current.has('gha-ctx')).toBe(true));
  });

  it('resolves the user via context.context.user, not by context name', async () => {
    mockFetch({ response_types_supported: ['id_token'] });
    const contexts = [
      { name: 'my-cluster', context: { cluster: 'c', user: 'oidc-user' } },
    ];
    const users = [
      { name: 'my-cluster', user: { token: 'some-token' } },
      {
        name: 'oidc-user',
        user: {
          exec: {
            command: 'kubectl-oidc_login',
            args: [`--oidc-issuer-url=${freshUrl()}`],
          },
        },
      },
    ];
    const { result } = renderHook(() =>
      useNonInteractiveOidcContexts(contexts, users as any),
    );
    await waitFor(() => expect(result.current.has('my-cluster')).toBe(true));
  });

  it('marks context with non-interactive OIDC issuer as non-interactive', async () => {
    mockFetch({ response_types_supported: ['id_token'] });
    const url = freshUrl();
    const contexts = [
      { name: 'gha-ctx', context: { cluster: 'c', user: 'gha-user' } },
    ];
    const users = [
      {
        name: 'gha-user',
        user: {
          exec: {
            command: 'kubectl-oidc_login',
            args: [`--oidc-issuer-url=${url}`],
          },
        },
      },
    ];
    const { result } = renderHook(() =>
      useNonInteractiveOidcContexts(contexts, users as any),
    );
    await waitFor(() => expect(result.current.has('gha-ctx')).toBe(true));
  });

  it('does not mark context with interactive OIDC issuer as non-interactive', async () => {
    // Use two contexts so we can wait for the non-interactive one and then assert on the interactive one
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation((url: string) =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve(
              url.includes('ias')
                ? { grant_types_supported: ['authorization_code'] }
                : { response_types_supported: ['id_token'] },
            ),
        }),
      ),
    );
    const contexts = [
      { name: 'ias-ctx', context: { cluster: 'c', user: 'ias-user' } },
      { name: 'gha-ctx', context: { cluster: 'c', user: 'gha-user' } },
    ];
    const users = [
      {
        name: 'ias-user',
        user: {
          exec: {
            command: 'kubectl-oidc_login',
            args: ['--oidc-issuer-url=https://ias.example.com/ias'],
          },
        },
      },
      {
        name: 'gha-user',
        user: {
          exec: {
            command: 'kubectl-oidc_login',
            args: ['--oidc-issuer-url=https://gha.example.com'],
          },
        },
      },
    ];
    const { result } = renderHook(() =>
      useNonInteractiveOidcContexts(contexts, users as any),
    );
    // Wait for the non-interactive context to appear, then verify interactive one is absent
    await waitFor(() => expect(result.current.has('gha-ctx')).toBe(true));
    expect(result.current.has('ias-ctx')).toBe(false);
  });

  it('treats context with no matching user entry as interactive', async () => {
    const contexts = [
      { name: 'ctx', context: { cluster: 'c', user: 'missing-user' } },
    ];
    const users = [
      {
        name: 'other-user',
        user: {
          exec: {
            command: 'kubectl-oidc_login',
            args: ['--oidc-issuer-url=https://example.com'],
          },
        },
      },
    ];
    const { result } = renderHook(() =>
      useNonInteractiveOidcContexts(contexts, users as any),
    );
    // Allow async operations to settle; the set should remain empty
    await new Promise((r) => setTimeout(r, 50));
    expect(result.current.has('ctx')).toBe(false);
  });
});
