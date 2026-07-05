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

// Remember which cluster the answer was for, so we don't reuse it after the
// user switches clusters.
type Verdict = { clusterUrl: string; eligible: boolean };

export function useJouleEligibility(): boolean {
  const { isEnabled, useJoule } = useFeature<KymaCompanionFeature>(
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

  const jouleConfigured = !!isEnabled && !!useJoule;
  const [verdict, setVerdict] = useState<Verdict | null>(null);

  useEffect(() => {
    if (!jouleConfigured || !clusterUrl || !hasCredentials) return;

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
          console.warn(
            `[Joule] Disabled: ${result.reason ?? 'cluster is not eligible'}.`,
          );
        }
        setVerdict({ clusterUrl, eligible: !!result.eligible });
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
    jouleConfigured,
    clusterUrl,
    oidcIssuerUrl,
    token,
    clientCertificateData,
    clientKeyData,
  ]);

  if (!jouleConfigured) return false;
  return verdict !== null && verdict.clusterUrl === clusterUrl
    ? verdict.eligible
    : false;
}
