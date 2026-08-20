import { useState, useEffect } from 'react';
import {
  KubeconfigContext,
  KubeconfigOIDCAuth,
  KubeconfigUser,
  NestedPartial,
} from 'types';
import { isOIDCExec } from './oidc-params';

// No TTL — entries persist for the page lifetime. A full reload clears the cache.
const discoveryCache = new Map<string, boolean>();

export async function isOidcInteractive(issuerUrl: string): Promise<boolean> {
  if (discoveryCache.has(issuerUrl)) return discoveryCache.get(issuerUrl)!;
  try {
    const base = issuerUrl.replace(/\/$/, '');
    const response = await fetch(`${base}/.well-known/openid-configuration`);
    if (!response.ok) {
      discoveryCache.set(issuerUrl, true);
      return true;
    }
    const metadata = await response.json();
    const grantTypes: string[] = metadata.grant_types_supported ?? [];
    const responseTypes: string[] = metadata.response_types_supported ?? [];
    // Interactive (authorization code) flow requires 'authorization_code' grant
    // or 'code' response type. Non-interactive providers (e.g. GHA, Terraform HCP)
    // only support 'id_token' response type and lack these.
    const result =
      grantTypes.includes('authorization_code') ||
      responseTypes.includes('code');
    discoveryCache.set(issuerUrl, result);
    return result;
  } catch {
    // fail-open: if the discovery endpoint is unreachable, allow the provider
    discoveryCache.set(issuerUrl, true);
    return true;
  }
}

export function useNonInteractiveOidcContexts(
  contexts: Array<NestedPartial<KubeconfigContext> | undefined> | undefined,
  users: Array<NestedPartial<KubeconfigUser> | undefined> | undefined,
): Set<string> {
  const [nonInteractive, setNonInteractive] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const oidcContexts = contexts ?? [];
    const oidcUsers = users ?? [];

    Promise.all(
      oidcContexts.map(async (context) => {
        const name = context?.name;
        if (!name) return null;

        // Resolve the user entry via context.context.user (kubeconfig spec mapping)
        const userName = context?.context?.user;
        if (!userName) return null;
        const user = oidcUsers.find((u) => u?.name === userName);

        // interactiveMode "Never" unambiguously marks an exec plugin as non-interactive
        const exec = (
          user?.user as NestedPartial<KubeconfigOIDCAuth> | undefined
        )?.exec;
        if (exec?.interactiveMode === 'Never') return name;

        // Only proceed with OIDC discovery for exec plugins carrying --oidc-issuer-url
        if (!isOIDCExec(exec as { args?: string[] } | undefined)) return null;

        const issuerUrl = exec?.args
          ?.find((a) => a?.startsWith('--oidc-issuer-url='))
          ?.replace('--oidc-issuer-url=', '');
        if (!issuerUrl) return null;

        const interactive = await isOidcInteractive(issuerUrl);
        return interactive ? null : name;
      }),
    ).then((results) => {
      if (!cancelled) {
        setNonInteractive(
          new Set(results.filter((r): r is string => r !== null)),
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [contexts, users]);

  return nonInteractive;
}
