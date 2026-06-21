import { getClusterConfig } from 'state/utils/getBackendInfo';

export type InsightsAuth = {
  clusterUrl?: string;
  certificateAuthorityData?: string;
  clusterToken?: string;
  clientCertificateData?: string;
  clientKeyData?: string;
};

export type GetInsightsParams = {
  resourceKind: string;
  resourceName: string;
  resourceApiVersion: string;
  namespace: string;
  auth: InsightsAuth;
  signal?: AbortSignal;
};

export async function getInsights({
  resourceKind,
  resourceName,
  resourceApiVersion,
  namespace,
  auth,
  signal,
}: GetInsightsParams): Promise<string> {
  const { backendAddress } = getClusterConfig();

  const response = await fetch(`${backendAddress}/ai-editor/insights`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      resource_kind: resourceKind,
      resource_name: resourceName,
      resource_api_version: resourceApiVersion,
      namespace,
      clusterUrl: auth.clusterUrl,
      certificateAuthorityData: auth.certificateAuthorityData,
      clusterToken: auth.clusterToken,
      clientCertificateData: auth.clientCertificateData,
      clientKeyData: auth.clientKeyData,
    }),
    signal,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      if (errorBody?.error) message = errorBody.error;
    } catch {
      // response had no JSON body; keep the status-based message
    }
    throw new Error(message);
  }

  const data = await response.json();
  if (typeof data?.insights !== 'string') {
    throw new Error('AI insights backend returned an unexpected response');
  }
  return data.insights;
}
