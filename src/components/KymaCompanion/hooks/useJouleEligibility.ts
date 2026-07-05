import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { clusterAtom } from 'state/clusterAtom';
import { deploymentConfigurationAtom } from 'state/configuration/configurationAtom';
import { configFeaturesNames, KymaCompanionFeature } from 'state/types';
import { useFeature } from 'hooks/useFeature';
import {
  isOIDCExec,
  tryParseOIDCparams,
} from 'components/Clusters/components/oidc-params';
import { KubeconfigOIDCAuth } from 'types';
import { extractShootId } from '../utils/extractShootId';
import { getClusterRegion } from '../api/getClusterRegion';

const stripTrailingSlash = (url: string) => url.replace(/\/+$/, '');

// Keyed by shootId so a previous cluster's verdict never applies to another.
type EUCheck = { shootId: string; isEUAccessOnly: boolean };

export function useJouleEligibility(): boolean {
  const { isEnabled, useJoule } = useFeature<KymaCompanionFeature>(
    configFeaturesNames.KYMA_COMPANION,
  );
  const cluster = useAtomValue(clusterAtom);
  const serverUrl = cluster?.currentContext?.cluster?.cluster?.server;
  const userExec = (cluster?.currentContext?.user?.user as KubeconfigOIDCAuth)
    ?.exec;
  const shootId = serverUrl ? extractShootId(serverUrl) : null;

  // From deployment config (not the cluster ConfigMap) so it can't be spoofed.
  const deploymentConfig = useAtomValue(deploymentConfigurationAtom);
  const allowedIssuerUrl = (
    deploymentConfig?.features?.[configFeaturesNames.KYMA_COMPANION] as
      | KymaCompanionFeature
      | undefined
  )?.config?.issuerUrl;

  const [euCheck, setEuCheck] = useState<EUCheck | null>(null);

  const jouleConfigured = !!isEnabled && !!useJoule;

  const isOIDCMismatch = (() => {
    if (!jouleConfigured || !allowedIssuerUrl) return false;
    if (!userExec || !isOIDCExec(userExec)) return false;
    const params = tryParseOIDCparams({ exec: userExec } as KubeconfigOIDCAuth);
    return (
      !!params?.issuerUrl &&
      stripTrailingSlash(params.issuerUrl) !==
        stripTrailingSlash(allowedIssuerUrl)
    );
  })();

  useEffect(() => {
    if (!jouleConfigured) return;
    if (isOIDCMismatch) {
      console.warn(
        '[Joule] Disabled: cluster OIDC issuer URL does not match the configured Kyma IAS URL.',
      );
      return;
    }
    if (!serverUrl) return;
    if (!shootId) {
      console.warn(
        '[Joule] Disabled: cluster server URL is not a Kyma SKR endpoint; cannot verify region.',
      );
      return;
    }

    const controller = new AbortController();
    getClusterRegion(shootId, controller.signal)
      .then((data) => {
        if (typeof data?.isEUAccessOnly !== 'boolean') {
          console.warn(
            '[Joule] cluster-region response missing boolean isEUAccessOnly; Joule will remain disabled.',
          );
          return;
        }
        if (data.isEUAccessOnly) {
          console.warn('[Joule] Disabled: cluster is EU Access Only.');
        }
        setEuCheck({ shootId, isEUAccessOnly: data.isEUAccessOnly });
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        console.warn(
          `[Joule] Could not determine cluster region (${err.message}); Joule will remain disabled.`,
        );
      });
    return () => controller.abort();
  }, [jouleConfigured, isOIDCMismatch, serverUrl, shootId]);

  if (!jouleConfigured || isOIDCMismatch) return false;
  const isEUAccessOnly =
    euCheck && euCheck.shootId === shootId ? euCheck.isEUAccessOnly : null;
  return isEUAccessOnly === false;
}
