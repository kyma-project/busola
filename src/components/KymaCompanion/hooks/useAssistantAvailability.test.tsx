import { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createStore, Provider } from 'jotai';

const mocks = vi.hoisted(() => ({
  feature: { isEnabled: true } as { isEnabled: boolean; useJoule?: boolean },
  isSAPUser: true,
  getJouleEligibility: vi.fn(),
}));

vi.mock('hooks/useFeature', () => ({ useFeature: () => mocks.feature }));
vi.mock('hooks/useCheckSAPUser', () => ({
  useCheckSAPUser: () => mocks.isSAPUser,
}));
vi.mock('../api/getJouleEligibility', () => ({
  getJouleEligibility: mocks.getJouleEligibility,
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
import { useAssistantAvailability } from './useAssistantAvailability';

const CLUSTER_URL = 'https://api.cluster.example';

const cluster = (server: string, execArgs?: string[]) =>
  ({
    currentContext: {
      cluster: { cluster: { server, 'certificate-authority-data': 'ca-data' } },
      user: { user: execArgs ? { exec: { args: execArgs } } : {} },
    },
  }) as any;

const setup = ({
  activeCluster = cluster(CLUSTER_URL),
  authData = { token: 'cluster-token' } as Record<string, string> | null,
} = {}) => {
  const store = createStore();
  store.set(clusterAtom, activeCluster);
  store.set(authDataAtom, authData as any);
  const view = renderHook(() => useAssistantAvailability(), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <Provider store={store}>{children}</Provider>
    ),
  });
  return { store, ...view };
};

const hidden = { showAssistant: false, useJouleMode: false };

describe('useAssistantAvailability', () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mocks.feature = { isEnabled: true };
    mocks.isSAPUser = true;
    mocks.getJouleEligibility.mockReset();
    mocks.getJouleEligibility.mockResolvedValue({ eligible: true });
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('hides the assistant and skips the eligibility check when the feature is disabled', () => {
    mocks.feature = { isEnabled: false, useJoule: true };

    const { result } = setup();

    expect(result.current).toEqual(hidden);
    expect(mocks.getJouleEligibility).not.toHaveBeenCalled();
  });

  it('hides the assistant from users who are not SAP users', async () => {
    mocks.feature = { isEnabled: true, useJoule: true };
    mocks.isSAPUser = false;

    const { result } = setup();

    await waitFor(() =>
      expect(mocks.getJouleEligibility).toHaveBeenCalledTimes(1),
    );
    expect(result.current).toEqual(hidden);
  });

  it('shows Companion without Joule mode when Joule is not configured', async () => {
    const { result } = setup();

    await waitFor(() =>
      expect(mocks.getJouleEligibility).toHaveBeenCalledTimes(1),
    );
    expect(result.current).toEqual({
      showAssistant: true,
      useJouleMode: false,
    });
  });

  it('shows Joule only after the cluster is confirmed eligible', async () => {
    mocks.feature = { isEnabled: true, useJoule: true };

    const { result } = setup();

    expect(result.current).toEqual(hidden);
    await waitFor(() =>
      expect(result.current).toEqual({
        showAssistant: true,
        useJouleMode: true,
      }),
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it('keeps Joule hidden and explains why when the cluster is not eligible', async () => {
    mocks.feature = { isEnabled: true, useJoule: true };
    mocks.getJouleEligibility.mockResolvedValue({
      eligible: false,
      reason: 'issuer-mismatch',
    });

    const { result } = setup();

    await waitFor(() =>
      expect(warn).toHaveBeenCalledWith(
        '[Joule] Disabled: the cluster OIDC issuer is not the Kyma IAS (issuer-mismatch).',
      ),
    );
    expect(result.current).toEqual(hidden);
  });

  it('uses a generic explanation for an unknown reason', async () => {
    mocks.feature = { isEnabled: true, useJoule: true };
    mocks.getJouleEligibility.mockResolvedValue({
      eligible: false,
      reason: 'something-new',
    });

    setup();

    await waitFor(() =>
      expect(warn).toHaveBeenCalledWith(
        '[Joule] Disabled: the cluster is not eligible (something-new).',
      ),
    );
  });

  it('hides Companion too on an EU Access Only cluster', async () => {
    mocks.getJouleEligibility.mockResolvedValue({
      eligible: false,
      reason: 'eu-access',
    });

    const { result } = setup();

    await waitFor(() => expect(result.current).toEqual(hidden));
  });

  it('keeps Companion visible when only Joule is ruled out', async () => {
    mocks.getJouleEligibility.mockResolvedValue({
      eligible: false,
      reason: 'not-skr',
    });

    const { result } = setup();

    await waitFor(() => expect(warn).toHaveBeenCalled());
    expect(result.current).toEqual({
      showAssistant: true,
      useJouleMode: false,
    });
  });

  it('keeps Joule hidden when the eligibility check fails', async () => {
    mocks.feature = { isEnabled: true, useJoule: true };
    mocks.getJouleEligibility.mockRejectedValue(new Error('HTTP 503'));

    const { result } = setup();

    await waitFor(() =>
      expect(warn).toHaveBeenCalledWith(
        '[Joule] Could not determine eligibility (HTTP 503); Joule will remain disabled.',
      ),
    );
    expect(result.current).toEqual(hidden);
  });

  it('ignores an aborted eligibility check', async () => {
    mocks.feature = { isEnabled: true, useJoule: true };
    mocks.getJouleEligibility.mockRejectedValue(
      new DOMException('Aborted', 'AbortError'),
    );

    const { result } = setup();

    await waitFor(() =>
      expect(mocks.getJouleEligibility).toHaveBeenCalledTimes(1),
    );
    await Promise.resolve();
    expect(warn).not.toHaveBeenCalled();
    expect(result.current).toEqual(hidden);
  });

  it('aborts the pending eligibility check on unmount', () => {
    mocks.getJouleEligibility.mockReturnValue(new Promise(() => {}));

    const { unmount } = setup();
    const signal: AbortSignal = mocks.getJouleEligibility.mock.calls[0][1];

    expect(signal.aborted).toBe(false);
    unmount();
    expect(signal.aborted).toBe(true);
  });

  it.each([
    ['there is no auth data', null],
    ['the client certificate pair is incomplete', { 'client-key-data': 'key' }],
  ])('skips the eligibility check when %s', (_, authData) => {
    mocks.feature = { isEnabled: true, useJoule: true };

    const { result } = setup({ authData });

    expect(mocks.getJouleEligibility).not.toHaveBeenCalled();
    expect(result.current).toEqual(hidden);
  });

  it('skips the eligibility check when no cluster is active', () => {
    setup({ activeCluster: null });

    expect(mocks.getJouleEligibility).not.toHaveBeenCalled();
  });

  it('sends token auth and the OIDC issuer of the kubeconfig', async () => {
    setup({
      activeCluster: cluster(CLUSTER_URL, [
        'oidc-login',
        'get-token',
        '--oidc-issuer-url=https://kyma.accounts.example',
        '--oidc-client-id=client',
      ]),
    });

    await waitFor(() =>
      expect(mocks.getJouleEligibility).toHaveBeenCalledWith(
        {
          clusterUrl: CLUSTER_URL,
          certificateAuthorityData: 'ca-data',
          token: 'cluster-token',
          clientCertificateData: undefined,
          clientKeyData: undefined,
          oidcIssuerUrl: 'https://kyma.accounts.example',
        },
        expect.any(AbortSignal),
      ),
    );
  });

  it('sends the client certificate pair and no issuer for a non-OIDC kubeconfig', async () => {
    setup({
      activeCluster: cluster(CLUSTER_URL, ['get-token']),
      authData: {
        'client-certificate-data': 'cert',
        'client-key-data': 'key',
      },
    });

    await waitFor(() =>
      expect(mocks.getJouleEligibility).toHaveBeenCalledWith(
        expect.objectContaining({
          token: undefined,
          clientCertificateData: 'cert',
          clientKeyData: 'key',
          oidcIssuerUrl: undefined,
        }),
        expect.any(AbortSignal),
      ),
    );
  });

  it('does not carry a verdict over to another cluster', async () => {
    mocks.feature = { isEnabled: true, useJoule: true };
    const { result, store } = setup();
    await waitFor(() => expect(result.current.useJouleMode).toBe(true));

    mocks.getJouleEligibility.mockReturnValue(new Promise(() => {}));
    store.set(clusterAtom, cluster('https://api.other-cluster.example'));

    await waitFor(() => expect(result.current).toEqual(hidden));
    expect(mocks.getJouleEligibility).toHaveBeenLastCalledWith(
      expect.objectContaining({
        clusterUrl: 'https://api.other-cluster.example',
      }),
      expect.any(AbortSignal),
    );
  });
});
