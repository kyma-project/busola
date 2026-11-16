import { it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, PropsWithChildren } from 'react';
import { MemoryRouter, useLocation } from 'react-router';
import { useGetConfiguration } from 'state/configuration/configurationAtom';
import { useSSOLogin } from 'state/ssoDataAtom';
import { useAuthHandler } from 'state/authDataAtom';
import { useAfterInitHook } from 'state/useAfterInitHook';
import { useLoginWithKubeconfigID } from './useLoginWithKubeconfigID';

const managerMock = vi.hoisted(() => ({
  getUser: vi.fn().mockResolvedValue(null),
  signinRedirect: vi.fn().mockResolvedValue(undefined),
  signinRedirectCallback: vi.fn(),
  clearStaleState: vi.fn().mockResolvedValue(undefined),
  events: { addUserUnloaded: vi.fn() },
}));

vi.mock('oidc-client-ts', () => ({
  UserManager: class {
    constructor() {
      return managerMock;
    }
  },
  User: class {},
}));

const RESPONSES: Record<string, string> = {
  '/active.env': 'SSO_LOGIN_BYPASS=true\n',
  '/defaultConfig.yaml': `
config:
  features:
    SSO_LOGIN: { isEnabled: true, config: { issuerUrl: https://idp.example, clientId: busola } }
    KUBECONFIG_ID: { isEnabled: true, config: { kubeconfigUrl: /kubeconfig } }
`,
  '/kubeconfig/abc': `
current-context: foo
clusters: [{ name: foo, cluster: { server: https://example.com } }]
users: [{ name: foo-user, user: { token: abc } }]
contexts: [{ name: foo, context: { cluster: foo, user: foo-user } }]
`,
};

it('loads the app and opens a kubeconfigID link without the SSO login when SSO_LOGIN_BYPASS is set', async () => {
  // useSSOLogin never redirects outside a secure context.
  Object.defineProperty(window, 'isSecureContext', { value: true });
  const fetchMock = vi.fn(async (url: string) => {
    const body = Object.entries(RESPONSES).find(([path]) =>
      url.startsWith(path),
    )?.[1];
    return { ok: true, text: async () => body ?? '', json: async () => ({}) };
  });
  vi.stubGlobal('fetch', fetchMock);
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      MemoryRouter,
      { initialEntries: ['/?kubeconfigID=abc'] },
      children,
    );

  const { result } = renderHook(
    () => {
      const kubeconfigIdState = useLoginWithKubeconfigID();
      useGetConfiguration();
      useSSOLogin();
      useAuthHandler();
      useAfterInitHook(kubeconfigIdState);
      return useLocation().pathname;
    },
    { wrapper },
  );

  await waitFor(() => expect(result.current).toBe('/cluster/foo/overview'));
  await waitFor(() =>
    expect(fetchMock).toHaveBeenCalledWith(
      '/backend/api/v1/namespaces/kube-public/configmaps/busola-config',
      expect.anything(),
    ),
  );
  expect(managerMock.signinRedirect).not.toHaveBeenCalled();
});
