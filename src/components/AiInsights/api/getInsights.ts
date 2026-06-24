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
  additionalContext?: string;
  auth: InsightsAuth;
  signal?: AbortSignal;
  onToken: (token: string) => void;
};

export async function getInsights({
  resourceKind,
  resourceName,
  resourceApiVersion,
  namespace,
  additionalContext,
  auth,
  signal,
  onToken,
}: GetInsightsParams): Promise<void> {
  const { backendAddress } = getClusterConfig();

  const response = await fetch(`${backendAddress}/ai-editor/insights`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    },
    body: JSON.stringify({
      resource_kind: resourceKind,
      resource_name: resourceName,
      resource_api_version: resourceApiVersion,
      namespace,
      additional_context: additionalContext ?? null,
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
      // no JSON body
    }
    throw new Error(message);
  }

  if (!response.body) {
    throw new Error('AI insights backend returned an empty response');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process complete lines; leave any partial last line in the buffer.
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (!data || data === '{}') continue; // done-event payload
        try {
          const parsed = JSON.parse(data);
          if (typeof parsed.token === 'string') {
            onToken(parsed.token);
          }
        } catch {
          // malformed SSE data — skip
        }
      }
    }
  }
}
