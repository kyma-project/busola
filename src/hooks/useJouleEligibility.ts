import { useMemo, useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { clusterAtom } from 'state/clusterAtom';
import { configFeaturesNames, KymaCompanionFeature } from 'state/types';
import { useFeature } from 'hooks/useFeature';
import {
  isOIDCExec,
  tryParseOIDCparams,
} from 'components/Clusters/components/oidc-params';
import { KubeconfigOIDCAuth } from 'types';
import { extractShootId } from 'components/KymaCompanion/utils/extractShootId';

// Strip trailing slashes so e.g. "https://kyma.accounts.ondemand.com/" and
// "https://kyma.accounts.ondemand.com" compare equal.
function normalizeUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

export function useJouleEligibility(): boolean {
  const { isEnabled, useJoule, config } = useFeature<KymaCompanionFeature>(
    configFeaturesNames.KYMA_COMPANION,
  );
  const cluster = useAtomValue(clusterAtom);
  const serverUrl = cluster?.currentContext?.cluster?.cluster?.server;
  const userExec = (cluster?.currentContext?.user?.user as KubeconfigOIDCAuth)
    ?.exec;

  const allowedIssuerUrl = config?.issuerUrl;

  // null = in-flight / unknown, true/false = confirmed
  const [isEUAccessOnly, setIsEUAccessOnly] = useState<boolean | null>(null);

  const isOIDCMismatch = useMemo(() => {
    if (!isEnabled || !useJoule || !allowedIssuerUrl) return false;
    if (!userExec || !isOIDCExec(userExec)) return false;
    const params = tryParseOIDCparams({ exec: userExec } as KubeconfigOIDCAuth);
    return (
      !!params?.issuerUrl &&
      normalizeUrl(params.issuerUrl) !== normalizeUrl(allowedIssuerUrl)
    );
  }, [isEnabled, useJoule, allowedIssuerUrl, userExec]);

  useEffect(() => {
    // When any precondition disqualifies Joule before the fetch, reset to
    // unknown via cleanup so we don't hold a stale verdict from a previous
    // cluster.
    if (!isEnabled || !useJoule || isOIDCMismatch) {
      return () => setIsEUAccessOnly(null);
    }
    if (!serverUrl) return;
    const shootId = extractShootId(serverUrl);
    if (!shootId) return;

    let cancelled = false;
    fetch(`/backend/ai-chat/cluster-region/${encodeURIComponent(shootId)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setIsEUAccessOnly(data.isEUAccessOnly === true);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn(
          `[Joule] Could not determine cluster region (${err.message}); Joule will remain disabled.`,
        );
        // Keep the verdict at null → fail-closed in the return logic below.
        setIsEUAccessOnly(null);
      });
    return () => {
      cancelled = true;
      setIsEUAccessOnly(null);
    };
  }, [isEnabled, useJoule, isOIDCMismatch, serverUrl]);

  // Emit a single warning when Joule transitions to disabled for a specific
  // reason — keeps the console quiet across re-renders.
  useEffect(() => {
    if (!isEnabled || !useJoule) return;
    if (isOIDCMismatch) {
      console.warn(
        '[Joule] Disabled: cluster OIDC issuer URL does not match the configured Kyma IAS URL.',
      );
    } else if (isEUAccessOnly === true) {
      console.warn('[Joule] Disabled: cluster is EU Access Only.');
    } else if (isEUAccessOnly === false) {
      console.log('[Joule] Enabled: cluster passed all eligibility checks.');
    }
  }, [isEnabled, useJoule, isOIDCMismatch, isEUAccessOnly]);

  if (!isEnabled || !useJoule) return false;
  if (isOIDCMismatch) return false;
  // null = in-flight or fetch failed → fail-closed
  return isEUAccessOnly === false;
}
