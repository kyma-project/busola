import { getClusterConfig } from 'state/utils/getBackendInfo';
import { extractApiGroup } from 'resources/Roles/helpers';

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
    const { backendAddress } = getClusterConfig();
    const url = `${backendAddress}/api/v1/namespaces/ai-core/services/http:ai-backend-clusterip:5000/proxy/api/v1/llm/init`;
    const apiGroup = extractApiGroup(groupVersion);
    const payload = JSON.parse(
      `{"resource_kind":"${resourceType.toLowerCase()}","resource_api_version": "${apiGroup}","resource_name":"${resourceName}","namespace":"${namespace}"}`,
    );
    const k8sAuthorization = `Bearer ${token}`;

    let { results } = await fetch(url, {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
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
