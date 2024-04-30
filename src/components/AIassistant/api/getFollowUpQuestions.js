import { getClusterConfig } from 'state/utils/getBackendInfo';

export default async function getFollowUpQuestions({
  sessionID = '',
  handleFollowUpQuestions,
  clusterUrl,
  token,
  certificateAuthorityData,
}) {
  try {
    const { backendAddress } = getClusterConfig();
    const url = `${backendAddress}/api/v1/namespaces/ai-core/services/http:ai-backend-clusterip:5000/proxy/api/v1/llm/followup`;
    const payload = JSON.parse(`{"session_id":"${sessionID}"}`);
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
    handleFollowUpQuestions(results);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}
