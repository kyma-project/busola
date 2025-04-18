import { getClusterConfig } from 'state/utils/getBackendInfo';
import { MessageChunk } from '../components/Chat/Message/Message';

interface ClusterAuth {
  token?: string;
  clientCertificateData?: string;
  clientKeyData?: string;
}

type GetChatResponseArgs = {
  query: string;
  namespace?: string;
  resourceType: string;
  groupVersion?: string;
  resourceName?: string;
  sessionID: string;
  handleChatResponse: (chunk: MessageChunk) => void;
  handleError: (error?: string) => void;
  clusterUrl: string;
  clusterAuth: ClusterAuth;
  certificateAuthorityData: string;
};

export default async function getChatResponse({
  query,
  namespace = '',
  resourceType,
  groupVersion = '',
  resourceName = '',
  sessionID,
  handleChatResponse,
  handleError,
  clusterUrl,
  clusterAuth,
  certificateAuthorityData,
}: GetChatResponseArgs): Promise<void> {
  const { backendAddress } = getClusterConfig();
  const url = `${backendAddress}/ai-chat/messages`;
  const payload = {
    query,
    namespace,
    resourceType,
    groupVersion,
    resourceName,
  };

  const headers: Record<string, string> = {
    Accept: 'text/event-stream',
    'Content-Type': 'application/json',
    'X-Cluster-Certificate-Authority-Data': certificateAuthorityData,
    'X-Cluster-Url': clusterUrl,
    'Session-Id': sessionID,
  };

  if (clusterAuth?.token) {
    headers['X-K8s-Authorization'] = clusterAuth?.token;
  } else if (clusterAuth?.clientCertificateData && clusterAuth?.clientKeyData) {
    headers['X-Client-Certificate-Data'] = clusterAuth?.clientCertificateData;
    headers['X-Client-Key-Data'] = clusterAuth?.clientKeyData;
  } else {
    throw new Error('Missing authentication credentials');
  }

  fetch(url, {
    headers,
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
  handleError: (error?: string) => void,
  sessionID: string,
) {
  reader
    .read()
    .then(({ done, value }) => {
      if (done) {
        return;
      }
      const receivedString = decoder.decode(value, { stream: true });
      const chunk = JSON.parse(receivedString);
      // custom error provided by busola backend during streaming, not by companion backend
      if (chunk?.error) {
        throw new Error(chunk?.error);
      }
      handleChatResponse(chunk);
      readChunk(reader, decoder, handleChatResponse, handleError, sessionID);
    })
    .catch(error => {
      handleError();
      console.error('Error reading stream:', error);
    });
}
