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
import { clusterAtom } from 'state/clusterAtom';
import { deploymentConfigurationAtom } from 'state/configuration/configurationAtom';

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

// The trusted issuer comes from the deployment config atom, not from useFeature.
function stubAtoms(cluster: unknown, issuerUrl = '') {
  mockUseAtomValue.mockImplementation((atom: unknown) => {
    if (atom === deploymentConfigurationAtom) {
      return { features: { KYMA_COMPANION: { config: { issuerUrl } } } };
    }
    if (atom === clusterAtom) return cluster;
    return undefined;
  });
}

function stubFeature(overrides: Record<string, unknown> = {}) {
  mockUseFeature.mockReturnValue({
    isEnabled: true,
    useJoule: true,
    ...overrides,
  });
}

describe('useJouleEligibility', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    stubAtoms(makeCluster());
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

  it('fails closed when isEUAccessOnly is missing from the response', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    (fetch as Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
    });
    const { result } = renderHook(() => useJouleEligibility());
    await waitFor(() =>
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('missing boolean isEUAccessOnly'),
      ),
    );
    expect(result.current).toBe(false);
  });

  it('fails closed when isEUAccessOnly is not a boolean', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    (fetch as Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ isEUAccessOnly: 'false' }), // string, not boolean
    });
    const { result } = renderHook(() => useJouleEligibility());
    await waitFor(() =>
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('missing boolean isEUAccessOnly'),
      ),
    );
    expect(result.current).toBe(false);
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

  it('returns false and warns when OIDC issuer does not match the deployment issuer', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    stubAtoms(
      makeCluster(SKR_SERVER, 'https://other.ias.example.com'),
      'https://kyma.accounts.ondemand.com',
    );
    const { result } = renderHook(() => useJouleEligibility());
    expect(result.current).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('OIDC issuer URL does not match'),
    );
  });

  it('treats issuer URLs differing only by trailing slash as a match', async () => {
    stubAtoms(
      makeCluster(SKR_SERVER, 'https://kyma.accounts.ondemand.com/'),
      'https://kyma.accounts.ondemand.com',
    );
    (fetch as Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ isEUAccessOnly: false }),
    });
    const { result } = renderHook(() => useJouleEligibility());
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('skips OIDC check when the deployment issuer is empty and proceeds to EU check', async () => {
    (fetch as Mock).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ isEUAccessOnly: false }),
    });
    stubAtoms(makeCluster(SKR_SERVER, 'https://any.ias.example.com'), '');
    const { result } = renderHook(() => useJouleEligibility());
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('does not fetch when cluster has no server URL', () => {
    stubAtoms({
      currentContext: {
        cluster: { cluster: {} },
        user: { user: { token: 'tok' } },
      },
    });
    renderHook(() => useJouleEligibility());
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not fetch and warns when server URL cannot yield a shoot ID', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    stubAtoms(makeCluster('https://k8s.example.com'));
    renderHook(() => useJouleEligibility());
    expect(fetch).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('not a Kyma SKR endpoint'),
    );
  });
});
