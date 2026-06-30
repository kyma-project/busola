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

const stripTrailingSlash = (url: string) => url.replace(/\/+$/, '');

export function useJouleEligibility(): boolean {
  const { isEnabled, useJoule, config } = useFeature<KymaCompanionFeature>(
    configFeaturesNames.KYMA_COMPANION,
  );
  const cluster = useAtomValue(clusterAtom);
  const serverUrl = cluster?.currentContext?.cluster?.cluster?.server;
  const userExec = (cluster?.currentContext?.user?.user as KubeconfigOIDCAuth)
    ?.exec;
  const allowedIssuerUrl = config?.issuerUrl;

  // null while unknown; fail-closed (Joule disabled) anywhere it stays null.
  const [isEUAccessOnly, setIsEUAccessOnly] = useState<boolean | null>(null);

  const isOIDCMismatch = useMemo(() => {
    if (!isEnabled || !useJoule || !allowedIssuerUrl) return false;
    if (!userExec || !isOIDCExec(userExec)) return false;
    const params = tryParseOIDCparams({ exec: userExec } as KubeconfigOIDCAuth);
    return (
      !!params?.issuerUrl &&
      stripTrailingSlash(params.issuerUrl) !==
        stripTrailingSlash(allowedIssuerUrl)
    );
  }, [isEnabled, useJoule, allowedIssuerUrl, userExec]);

  useEffect(() => {
    // Reset the verdict on cleanup so a previous cluster's answer never leaks into the next render.
    if (!isEnabled || !useJoule || isOIDCMismatch) {
      return () => setIsEUAccessOnly(null);
    }
    if (!serverUrl) return;
    const shootId = extractShootId(serverUrl);
    if (!shootId) {
      console.warn(
        '[Joule] Disabled: cluster server URL is not a Kyma SKR endpoint; cannot verify region.',
      );
      return;
    }

    let cancelled = false;
    fetch(`/backend/ai-chat/cluster-region/${encodeURIComponent(shootId)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        if (typeof data?.isEUAccessOnly !== 'boolean') {
          console.warn(
            '[Joule] cluster-region response missing boolean isEUAccessOnly; Joule will remain disabled.',
          );
          return;
        }
        setIsEUAccessOnly(data.isEUAccessOnly);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn(
          `[Joule] Could not determine cluster region (${err.message}); Joule will remain disabled.`,
        );
      });
    return () => {
      cancelled = true;
      setIsEUAccessOnly(null);
    };
  }, [isEnabled, useJoule, isOIDCMismatch, serverUrl]);

  // Warn once per disablement reason — success is the silent default.
  useEffect(() => {
    if (!isEnabled || !useJoule) return;
    if (isOIDCMismatch) {
      console.warn(
        '[Joule] Disabled: cluster OIDC issuer URL does not match the configured Kyma IAS URL.',
      );
    } else if (isEUAccessOnly === true) {
      console.warn('[Joule] Disabled: cluster is EU Access Only.');
    }
  }, [isEnabled, useJoule, isOIDCMismatch, isEUAccessOnly]);

  if (!isEnabled || !useJoule || isOIDCMismatch) return false;
  return isEUAccessOnly === false;
}
