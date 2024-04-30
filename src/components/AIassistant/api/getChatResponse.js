import { getClusterConfig } from 'state/utils/getBackendInfo';

export default async function getChatResponse({
  prompt,
  handleChatResponse,
  handleError,
  sessionID,
  clusterUrl,
  token,
  certificateAuthorityData,
}) {
  const { backendAddress } = getClusterConfig();
  const url = `${backendAddress}/api/v1/namespaces/ai-core/services/http:ai-backend-clusterip:5000/proxy/api/v1/chat`;
  const payload = { question: prompt, session_id: sessionID };
  const k8sAuthorization = `Bearer ${token}`;

  fetch(url, {
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
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      readChunk(reader, decoder, handleChatResponse, handleError, sessionID);
    })
    .catch(error => {
      handleError();
      console.error('Error fetching data:', error);
    });
}

function readChunk(
  reader,
  decoder,
  handleChatResponse,
  handleError,
  sessionID,
) {
  reader
    .read()
    .then(({ done, value }) => {
      if (done) {
        return;
      }
      // Also handles the rare case of two chunks being sent at once
      const receivedString = decoder.decode(value, { stream: true });
      const chunks = receivedString.match(/{[^{}]*}/g).map(chunk => {
        return JSON.parse(chunk);
      });
      chunks.forEach(chunk => {
        if ('error' in chunk) {
          throw new Error(chunk.error);
        }
        handleChatResponse(chunk);
      });
      readChunk(reader, decoder, handleChatResponse, handleError, sessionID);
    })
    .catch(error => {
      handleError();
      console.error('Error reading stream:', error);
    });
}
