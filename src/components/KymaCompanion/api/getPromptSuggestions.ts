interface GetPromptSuggestionsParams {
  namespace?: string;
  resourceType?: string;
  groupVersion?: string;
  resourceName?: string;
  clusterUrl: string;
  token: string;
  certificateAuthorityData: string;
}

export default async function getPromptSuggestions({
  namespace = '',
  resourceType = '',
  groupVersion = '',
  resourceName = '',
  clusterUrl,
  token,
  certificateAuthorityData,
}: GetPromptSuggestionsParams): Promise<string[] | false> {
  try {
    const url = 'https://companion.cp.dev.kyma.cloud.sap/api/conversations/';
    const payload = JSON.parse(
      `{"resource_kind":"${resourceType.toLowerCase()}","resource_api_version": "${groupVersion}","resource_name":"${resourceName}","namespace":"${namespace}"}`,
    );
    const k8sAuthorization = `Bearer ${token}`;

    const AUTH_TOKEN = '<AUTH_TOKEN>';
    let { results } = await fetch(url, {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AUTH_TOKEN}`,
        'X-Cluster-Certificate-Authority-Data': certificateAuthorityData,
        'X-Cluster-Url': clusterUrl,
        'X-K8s-Authorization': k8sAuthorization,
      },
      body: JSON.stringify(payload),
      method: 'POST',
    }).then(result => result.json());
    return results;
  } catch (error) {
    console.error('Error fetching data:', error);
    return false;
  }
}
