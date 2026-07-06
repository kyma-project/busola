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
import { authDataAtom } from 'state/authDataAtom';

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

function stubAtoms(cluster: unknown, authData: unknown = { token: 'tok' }) {
  mockUseAtomValue.mockImplementation((atom: unknown) => {
    if (atom === clusterAtom) return cluster;
    if (atom === authDataAtom) return authData;
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

function stubFetch(result: { eligible: boolean; reason?: string }) {
  (fetch as Mock).mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => result,
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

  it('returns ineligible and does not fetch when KYMA_COMPANION is disabled', () => {
    stubFeature({ isEnabled: false });
    const { result } = renderHook(() => useJouleEligibility());
    expect(result.current.eligible).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('runs the check even when useJoule is false (Companion deployments)', async () => {
    stubFeature({ useJoule: false });
    stubFetch({ eligible: true });
    const { result } = renderHook(() => useJouleEligibility());
    await waitFor(() => expect(result.current.eligible).toBe(true));
    expect(fetch).toHaveBeenCalled();
  });

  it('does not fetch when the cluster has no credentials', () => {
    stubAtoms(makeCluster(), null);
    renderHook(() => useJouleEligibility());
    expect(fetch).not.toHaveBeenCalled();
  });

  it('does not fetch when the cluster has no server URL', () => {
    stubAtoms({
      currentContext: { cluster: { cluster: {} }, user: { user: {} } },
    });
    renderHook(() => useJouleEligibility());
    expect(fetch).not.toHaveBeenCalled();
  });

  it('is ineligible while the eligibility check is in-flight (fail-closed)', () => {
    (fetch as Mock).mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useJouleEligibility());
    expect(result.current.eligible).toBe(false);
  });

  it('is eligible when the backend reports eligible', async () => {
    stubFetch({ eligible: true });
    const { result } = renderHook(() => useJouleEligibility());
    await waitFor(() => expect(result.current.eligible).toBe(true));
  });

  it('surfaces the reason and warns when the backend reports ineligible', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    stubFetch({ eligible: false, reason: 'eu-access' });
    const { result } = renderHook(() => useJouleEligibility());
    await waitFor(() => expect(result.current.reason).toBe('eu-access'));
    expect(result.current.eligible).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('eu-access'));
  });

  it('remains ineligible and warns when the request fails', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    (fetch as Mock).mockResolvedValue({ ok: false, status: 500 });
    const { result } = renderHook(() => useJouleEligibility());
    await waitFor(() =>
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Could not determine eligibility'),
      ),
    );
    expect(result.current.eligible).toBe(false);
  });

  it('POSTs the cluster credentials and OIDC issuer to the backend', async () => {
    const fetchMock = fetch as Mock;
    stubFetch({ eligible: true });
    stubAtoms(makeCluster(SKR_SERVER, 'https://kyma.accounts.ondemand.com'));

    const { result } = renderHook(() => useJouleEligibility());
    await waitFor(() => expect(result.current.eligible).toBe(true));

    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toContain('/ai-chat/joule-eligibility');
    expect(opts.method).toBe('POST');
    const body = JSON.parse(opts.body);
    expect(body.clusterUrl).toBe(SKR_SERVER);
    expect(body.clusterToken).toBe('tok');
    expect(body.oidcIssuerUrl).toBe('https://kyma.accounts.ondemand.com');
  });
});
