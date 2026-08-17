import { useState, useEffect } from 'react';

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

function getOidcIssuerUrlForContext(
  contextName: string,
  users: Array<{ name?: string; user?: { exec?: { args?: string[] } } }>,
): string | null {
  const user = users.find((u) => u.name === contextName);
  const args = user?.user?.exec?.args;
  if (!args) return null;
  const arg = args.find((a) => a?.startsWith('--oidc-issuer-url='));
  return arg ? arg.replace('--oidc-issuer-url=', '') : null;
}

export function useNonInteractiveOidcContexts(
  contexts: Array<{ name?: string } | undefined> | undefined,
  users:
    | Array<{ name?: string; user?: { exec?: { args?: string[] } } }>
    | undefined,
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
        const issuerUrl = getOidcIssuerUrlForContext(name, oidcUsers);
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
