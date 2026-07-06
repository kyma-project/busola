import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { clusterAtom } from 'state/clusterAtom';
import { authDataAtom } from 'state/authDataAtom';
import { configFeaturesNames, KymaCompanionFeature } from 'state/types';
import { useFeature } from 'hooks/useFeature';
import {
  isOIDCExec,
  tryParseOIDCparams,
} from 'components/Clusters/components/oidc-params';
import { KubeconfigOIDCAuth } from 'types';
import { getJouleEligibility } from '../api/getJouleEligibility';

// Tagged with its cluster so a stale verdict isn't reused after a switch.
type Verdict = { clusterUrl: string; eligible: boolean; reason?: string };

// reason lets the caller gate the Companion too (EU Access Only blocks both),
// so the check runs whenever the assistant is enabled, not just for Joule.
export type AssistantEligibility = { eligible: boolean; reason?: string };

const DISABLE_REASONS: Record<string, string> = {
  'issuer-mismatch': 'the cluster OIDC issuer is not the Kyma IAS',
  'static-token':
    'static token kubeconfigs cannot be verified against the Kyma IAS',
  'eu-access': 'the cluster is EU Access Only',
  'not-skr': 'the cluster is not a Kyma SKR',
  unknown: 'the cluster region could not be determined',
  'not-configured': 'the companion backend is not configured',
};

export function useJouleEligibility(): AssistantEligibility {
  const { isEnabled } = useFeature<KymaCompanionFeature>(
    configFeaturesNames.KYMA_COMPANION,
  );
  const cluster = useAtomValue(clusterAtom);
  const authData = useAtomValue(authDataAtom) as {
    token?: string;
    'client-certificate-data'?: string;
    'client-key-data'?: string;
  } | null;

  const clusterUrl = cluster?.currentContext?.cluster?.cluster?.server;
  const certificateAuthorityData =
    cluster?.currentContext?.cluster?.cluster?.['certificate-authority-data'];
  const userExec = (cluster?.currentContext?.user?.user as KubeconfigOIDCAuth)
    ?.exec;
  const oidcIssuerUrl =
    userExec && isOIDCExec(userExec)
      ? tryParseOIDCparams({ exec: userExec } as KubeconfigOIDCAuth)?.issuerUrl
      : undefined;

  const token = authData?.token;
  const clientCertificateData = authData?.['client-certificate-data'];
  const clientKeyData = authData?.['client-key-data'];
  const hasCredentials = !!token || !!(clientCertificateData && clientKeyData);

  const [verdict, setVerdict] = useState<Verdict | null>(null);

  useEffect(() => {
    if (!isEnabled || !clusterUrl || !hasCredentials) return;

    const controller = new AbortController();
    getJouleEligibility(
      {
        clusterUrl,
        certificateAuthorityData,
        token,
        clientCertificateData,
        clientKeyData,
        oidcIssuerUrl,
      },
      controller.signal,
    )
      .then((result) => {
        if (!result.eligible) {
          const explanation =
            DISABLE_REASONS[result.reason ?? ''] ??
            'the cluster is not eligible';
          console.warn(`[Joule] Disabled: ${explanation} (${result.reason}).`);
        }
        setVerdict({
          clusterUrl,
          eligible: !!result.eligible,
          reason: result.reason,
        });
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        console.warn(
          `[Joule] Could not determine eligibility (${err.message}); Joule will remain disabled.`,
        );
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isEnabled,
    clusterUrl,
    oidcIssuerUrl,
    token,
    clientCertificateData,
    clientKeyData,
  ]);

  if (!isEnabled || verdict === null || verdict.clusterUrl !== clusterUrl) {
    return { eligible: false };
  }
  return { eligible: verdict.eligible, reason: verdict.reason };
}
