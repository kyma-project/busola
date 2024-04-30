import { getClusterConfig } from 'state/utils/getBackendInfo';
import { extractApiGroup } from 'resources/Roles/helpers';

export default async function getPromptSuggestions({
  namespace = '',
  resourceType = '',
  groupVersion = '',
  resourceName = '',
  sessionID = '',
  clusterUrl,
  token,
  certificateAuthorityData,
}) {
  try {
    const { backendAddress } = getClusterConfig();
    const url = `${backendAddress}/api/v1/namespaces/ai-core/services/http:ai-backend-clusterip:5000/proxy/api/v1/llm/init`;
    const apiGroup = extractApiGroup(groupVersion);
    const payload = JSON.parse(
      `{"resource_type":"${resourceType.toLowerCase()}${
        apiGroup.length ? `.${apiGroup}` : ''
      }","resource_name":"${resourceName}","namespace":"${namespace}","session_id":"${sessionID}"}`,
    );
    const k8sAuthorization = `Bearer ${token}`;

    let { results } = await fetch(url, {
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'X-Cluster-Certificate-Authority-Data': certificateAuthorityData,
        'X-Cluster-Url': clusterUrl,
        'X-K8s-Authorization': k8sAuthorization,
        'X-User': sessionID,
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
