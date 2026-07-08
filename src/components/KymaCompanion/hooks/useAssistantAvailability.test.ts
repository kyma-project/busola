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
import { useAssistantAvailability } from './useAssistantAvailability';
import { clusterAtom } from 'state/clusterAtom';
import { authDataAtom } from 'state/authDataAtom';

vi.mock('hooks/useFeature');
vi.mock('hooks/useCheckSAPUser');
vi.mock('jotai', async (importOriginal) => {
  const actual = await importOriginal<typeof import('jotai')>();
  return { ...actual, useAtomValue: vi.fn() };
});

import { useFeature } from 'hooks/useFeature';
import { useCheckSAPUser } from 'hooks/useCheckSAPUser';
import { useAtomValue } from 'jotai';

const mockUseFeature = useFeature as Mock;
const mockUseCheckSAPUser = useCheckSAPUser as Mock;
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

function stubEligibility(result: { eligible: boolean; reason?: string }) {
  (fetch as Mock).mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => result,
  });
}

describe('useAssistantAvailability', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    mockUseCheckSAPUser.mockReturnValue(true);
    stubAtoms(makeCluster());
    stubFeature();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('EU Access Only — compliance-critical', () => {
    it('hides the assistant entirely when the cluster is EU Access Only, even without Joule', async () => {
      stubFeature({ useJoule: false });
      stubEligibility({ eligible: false, reason: 'eu-access' });
      const { result } = renderHook(() => useAssistantAvailability());
      await waitFor(() => expect(result.current.showAssistant).toBe(false));
      expect(result.current.useJouleMode).toBe(false);
    });

    it('hides the assistant when the cluster is EU Access Only and Joule is configured', async () => {
      stubFeature({ useJoule: true });
      stubEligibility({ eligible: false, reason: 'eu-access' });
      const { result } = renderHook(() => useAssistantAvailability());
      await waitFor(() => expect(result.current.showAssistant).toBe(false));
      expect(result.current.useJouleMode).toBe(false);
    });
  });

  describe('Other Joule disqualifiers — Companion stays, Joule goes', () => {
    it.each([
      'issuer-mismatch',
      'static-token',
      'not-skr',
      'unknown',
      'not-configured',
    ])(
      'when useJoule is true and reason=%s, hides the assistant',
      async (reason) => {
        stubFeature({ useJoule: true });
        stubEligibility({ eligible: false, reason });
        const { result } = renderHook(() => useAssistantAvailability());
        await waitFor(() => expect(result.current.showAssistant).toBe(false));
        expect(result.current.useJouleMode).toBe(false);
      },
    );

    it.each([
      'issuer-mismatch',
      'static-token',
      'not-skr',
      'unknown',
      'not-configured',
    ])(
      'when useJoule is false and reason=%s, keeps the Companion visible',
      async (reason) => {
        stubFeature({ useJoule: false });
        stubEligibility({ eligible: false, reason });
        const { result } = renderHook(() => useAssistantAvailability());
        await waitFor(() => expect(result.current.showAssistant).toBe(true));
        expect(result.current.useJouleMode).toBe(false);
      },
    );
  });

  describe('Base gating', () => {
    it('hides the assistant and does not fetch when the feature is disabled', () => {
      stubFeature({ isEnabled: false });
      const { result } = renderHook(() => useAssistantAvailability());
      expect(result.current.showAssistant).toBe(false);
      expect(result.current.useJouleMode).toBe(false);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('hides the assistant for non-SAP users', async () => {
      mockUseCheckSAPUser.mockReturnValue(false);
      stubEligibility({ eligible: true });
      const { result } = renderHook(() => useAssistantAvailability());
      // Even after eligibility resolves eligible=true, SAP-user gate wins.
      await new Promise((r) => setTimeout(r, 20));
      expect(result.current.showAssistant).toBe(false);
      expect(result.current.useJouleMode).toBe(false);
    });
  });

  describe('Eligibility fetch behavior — fail-closed', () => {
    it('is ineligible while the eligibility check is in-flight', () => {
      (fetch as Mock).mockReturnValue(new Promise(() => {})); // never resolves
      const { result } = renderHook(() => useAssistantAvailability());
      expect(result.current.showAssistant).toBe(false);
      expect(result.current.useJouleMode).toBe(false);
    });

    it('does not fetch when the cluster has no credentials', () => {
      stubAtoms(makeCluster(), null);
      renderHook(() => useAssistantAvailability());
      expect(fetch).not.toHaveBeenCalled();
    });

    it('does not fetch when the cluster has no server URL', () => {
      stubAtoms({
        currentContext: { cluster: { cluster: {} }, user: { user: {} } },
      });
      renderHook(() => useAssistantAvailability());
      expect(fetch).not.toHaveBeenCalled();
    });

    it('warns and stays hidden when the eligibility request fails', async () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      (fetch as Mock).mockResolvedValue({ ok: false, status: 500 });
      // useJoule=true so the assistant is Joule-mode and depends on eligibility.
      stubFeature({ useJoule: true });
      const { result } = renderHook(() => useAssistantAvailability());
      await waitFor(() =>
        expect(warnSpy).toHaveBeenCalledWith(
          expect.stringContaining('Could not determine eligibility'),
        ),
      );
      expect(result.current.showAssistant).toBe(false);
    });

    it('POSTs the cluster credentials and OIDC issuer to the backend', async () => {
      const fetchMock = fetch as Mock;
      stubEligibility({ eligible: true });
      stubAtoms(makeCluster(SKR_SERVER, 'https://kyma.accounts.ondemand.com'));

      const { result } = renderHook(() => useAssistantAvailability());
      await waitFor(() => expect(result.current.showAssistant).toBe(true));

      const [url, opts] = fetchMock.mock.calls[0];
      expect(url).toContain('/ai-chat/joule-eligibility');
      expect(opts.method).toBe('POST');
      const body = JSON.parse(opts.body);
      expect(body.clusterUrl).toBe(SKR_SERVER);
      expect(body.clusterToken).toBe('tok');
      expect(body.oidcIssuerUrl).toBe('https://kyma.accounts.ondemand.com');
    });
  });

  describe('Happy paths', () => {
    it('shows the Companion when useJoule=false and cluster is eligible', async () => {
      stubFeature({ useJoule: false });
      stubEligibility({ eligible: true });
      const { result } = renderHook(() => useAssistantAvailability());
      await waitFor(() => expect(result.current.showAssistant).toBe(true));
      expect(result.current.useJouleMode).toBe(false);
    });

    it('shows Joule when useJoule=true and cluster is eligible', async () => {
      stubFeature({ useJoule: true });
      stubEligibility({ eligible: true });
      const { result } = renderHook(() => useAssistantAvailability());
      await waitFor(() => expect(result.current.showAssistant).toBe(true));
      expect(result.current.useJouleMode).toBe(true);
    });
  });
});
