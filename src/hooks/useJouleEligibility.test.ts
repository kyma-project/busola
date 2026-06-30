import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useJouleEligibility } from './useJouleEligibility';

vi.mock('hooks/useFeature');
vi.mock('jotai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('jotai')>();
  return { ...actual, useAtomValue: vi.fn() };
});

import { useFeature } from 'hooks/useFeature';
import { useAtomValue } from 'jotai';

const mockUseFeature = useFeature as Mock;
const mockUseAtomValue = useAtomValue as Mock;

const SKR_SERVER = 'https://api.c-abc123.kyma.example.com';

const makeCluster = (serverUrl = SKR_SERVER, oidcIssuerUrl?: string) => ({
  currentContext: {
    cluster: { cluster: { server: serverUrl } },
    user: {
      user: oidcIssuerUrl
        ? {
            exec: {
              apiVersion: 'client.authentication.k8s.io/v1beta1',
              command: 'kubectl',
              args: [
                `--oidc-issuer-url=${oidcIssuerUrl}`,
                '--oidc-client-id=foo',
              ],
            },
          }
        : { token: 'tok' },
    },
  },
});

function stubFeature(overrides: Record<string, unknown> = {}) {
  mockUseFeature.mockReturnValue({
    isEnabled: true,
    useJoule: true,
    config: { issuerUrl: '' },
    jouleConfig: { url: 'https://joule.example.com', botname: 'kyma' },
    ...overrides,
  });
}

describe('useJouleEligibility', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    mockUseAtomValue.mockReturnValue(makeCluster());
    stubFeature();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns false when KYMA_COMPANION is disabled', () => {
    stubFeature({ isEnabled: false });
    const { result } = renderHook(() => useJouleEligibility());
    expect(result.current).toBe(false);
  });

  it('returns false when useJoule is false in config', () => {
    stubFeature({ useJoule: false });
    const { result } = renderHook(() => useJouleEligibility());
    expect(result.current).toBe(false);
  });

  it('returns false while EU check is in-flight (fail-closed)', () => {
    (fetch as Mock).mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useJouleEligibility());
    expect(result.current).toBe(false);
  });

  it('returns true when EU check resolves isEUAccessOnly: false', async () => {
    (fetch as Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ isEUAccessOnly: false }),
    });
    const { result } = renderHook(() => useJouleEligibility());
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('returns false when EU check resolves isEUAccessOnly: true', async () => {
    (fetch as Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ isEUAccessOnly: true }),
    });
    const { result } = renderHook(() => useJouleEligibility());
    await waitFor(() => expect(result.current).toBe(false));
  });

  it('remains false and warns when EU check fetch fails', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    (fetch as Mock).mockRejectedValue(new Error('network error'));
    const { result } = renderHook(() => useJouleEligibility());
    await waitFor(() =>
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not determine cluster region'),
      ),
    );
    expect(result.current).toBe(false);
  });

  it('remains false when backend returns a non-OK status (fail-closed)', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    (fetch as Mock).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'upstream failure' }),
    });
    const { result } = renderHook(() => useJouleEligibility());
    await waitFor(() =>
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not determine cluster region'),
      ),
    );
    expect(result.current).toBe(false);
  });

  it('returns false and warns when OIDC issuer does not match config.issuerUrl', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    stubFeature({
      config: { issuerUrl: 'https://kyma.accounts.ondemand.com' },
    });
    mockUseAtomValue.mockReturnValue(
      makeCluster(SKR_SERVER, 'https://other.ias.example.com'),
    );
    const { result } = renderHook(() => useJouleEligibility());
    expect(result.current).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('OIDC issuer URL does not match'),
    );
  });

  it('treats issuer URLs differing only by trailing slash as a match', async () => {
    stubFeature({
      config: { issuerUrl: 'https://kyma.accounts.ondemand.com' },
    });
    mockUseAtomValue.mockReturnValue(
      makeCluster(SKR_SERVER, 'https://kyma.accounts.ondemand.com/'),
    );
    (fetch as Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ isEUAccessOnly: false }),
    });
    const { result } = renderHook(() => useJouleEligibility());
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('skips OIDC check when issuerUrl is empty and proceeds to EU check', async () => {
    // config.issuerUrl empty → OIDC check skipped
    (fetch as Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ isEUAccessOnly: false }),
    });
    mockUseAtomValue.mockReturnValue(
      makeCluster(SKR_SERVER, 'https://any.ias.example.com'),
    );
    const { result } = renderHook(() => useJouleEligibility());
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('does not fetch when cluster has no server URL', () => {
    mockUseAtomValue.mockReturnValue({
      currentContext: {
        cluster: { cluster: {} },
        user: { user: { token: 'tok' } },
      },
    });
    renderHook(() => useJouleEligibility());
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not fetch when server URL cannot yield a shoot ID', () => {
    mockUseAtomValue.mockReturnValue(makeCluster('https://k8s.example.com'));
    renderHook(() => useJouleEligibility());
    expect(fetch).not.toHaveBeenCalled();
  });
});
