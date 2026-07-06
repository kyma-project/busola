import { getClusterConfig } from 'state/utils/getBackendInfo';

export interface JouleEligibility {
  eligible: boolean;
  reason?: string;
}

export interface JouleEligibilityParams {
  clusterUrl: string;
  certificateAuthorityData?: string;
  token?: string;
  clientCertificateData?: string;
  clientKeyData?: string;
  oidcIssuerUrl?: string;
}

export async function getJouleEligibility(
  params: JouleEligibilityParams,
  signal?: AbortSignal,
): Promise<JouleEligibility> {
  const { backendAddress } = getClusterConfig();
  const response = await fetch(`${backendAddress}/ai-chat/joule-eligibility`, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({
      clusterUrl: params.clusterUrl,
      certificateAuthorityData: params.certificateAuthorityData,
      clusterToken: params.token,
      clientCertificateData: params.clientCertificateData,
      clientKeyData: params.clientKeyData,
      oidcIssuerUrl: params.oidcIssuerUrl,
    }),
    signal,
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}
