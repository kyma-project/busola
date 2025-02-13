interface GetPromptSuggestionsParams {
  namespace?: string;
  resourceType?: string;
  groupVersion?: string;
  resourceName?: string;
  clusterUrl: string;
  clusterToken: string;
  certificateAuthorityData: string;
}

interface PromptSuggestionsResponse {
  promptSuggestions: string[];
  conversationId: string;
}

export default async function getPromptSuggestions({
  namespace = '',
  resourceType = '',
  groupVersion = '',
  resourceName = '',
  clusterUrl,
  clusterToken,
  certificateAuthorityData,
}: GetPromptSuggestionsParams): Promise<PromptSuggestionsResponse | false> {
  try {
    const url = 'https://companion.cp.dev.kyma.cloud.sap/api/conversations/';
    const payload = JSON.parse(
      `{"resource_kind":"${resourceType}","resource_api_version": "${groupVersion}","resource_name":"${resourceName}","namespace":"${namespace}"}`,
    );
    const AUTH_TOKEN = '<AUTH_TOKEN>';

    const response = await fetch(url, {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AUTH_TOKEN}`,
        'X-Cluster-Certificate-Authority-Data': certificateAuthorityData,
        'X-Cluster-Url': clusterUrl,
        'X-K8s-Authorization': clusterToken,
      },
      body: JSON.stringify(payload),
      method: 'POST',
    });
    const data = await response.json();

    return {
      promptSuggestions: data.initial_questions,
      conversationId: data.conversation_id,
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    return false;
  }
}
