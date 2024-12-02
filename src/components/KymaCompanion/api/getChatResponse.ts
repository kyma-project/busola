import { getClusterConfig } from 'state/utils/getBackendInfo';
import { parseWithNestedBrackets } from '../utils/parseNestedBrackets';

type GetChatResponseArgs = {
  prompt: string;
  handleChatResponse: (chunk: any) => void;
  handleError: () => void;
  sessionID: string;
  clusterUrl: string;
  token: string;
  certificateAuthorityData: string;
};

export default async function getChatResponse({
  prompt,
  handleChatResponse,
  handleError,
  sessionID,
  clusterUrl,
  token,
  certificateAuthorityData,
}: GetChatResponseArgs): Promise<void> {
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
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get reader from response body');
      }
      const decoder = new TextDecoder();
      readChunk(reader, decoder, handleChatResponse, handleError, sessionID);
    })
    .catch(error => {
      handleError();
      console.error('Error fetching data:', error);
    });
}

function readChunk(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder,
  handleChatResponse: (chunk: any) => void,
  handleError: () => void,
  sessionID: string,
) {
  reader
    .read()
    .then(({ done, value }) => {
      if (done) {
        return;
      }
      // Also handles the rare case of two chunks being sent at once
      const receivedString = decoder.decode(value, { stream: true });
      const chunks = parseWithNestedBrackets(receivedString).map(chunk => {
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
