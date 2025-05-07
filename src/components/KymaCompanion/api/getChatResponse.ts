import { getClusterConfig } from 'state/utils/getBackendInfo';
import {
  ErrorType,
  ErrResponse,
  MessageChunk,
} from '../components/Chat/Message/Message';
import { HttpError } from './error';
import {
  handleChatErrorResponseFn,
  handleChatResponseFn,
  retryFetch,
} from 'components/KymaCompanion/api/retry';

const MAX_ATTEMPTS = 3;
const RETRY_DELAY = 1_000;

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
  handleChatResponse: handleChatResponseFn;
  handleError: handleChatErrorResponseFn;
  clusterUrl: string;
  clusterAuth: ClusterAuth;
  certificateAuthorityData: string;
};

const fillAuthHeaders = (
  headers: Record<string, string>,
  clusterAuth: ClusterAuth,
) => {
  if (clusterAuth?.token) {
    headers['X-K8s-Authorization'] = clusterAuth?.token;
  } else if (clusterAuth?.clientCertificateData && clusterAuth?.clientKeyData) {
    headers['X-Client-Certificate-Data'] = clusterAuth?.clientCertificateData;
    headers['X-Client-Key-Data'] = clusterAuth?.clientKeyData;
  } else {
    throw new Error('Missing authentication credentials');
  }
};
const createBasicHeaders = (
  certificateAuthorityData: string,
  clusterUrl: string,
  sessionID: string,
) => {
  const headers: Record<string, string> = {
    Accept: 'text/event-stream',
    'Content-Type': 'application/json',
    'X-Cluster-Certificate-Authority-Data': certificateAuthorityData,
    'X-Cluster-Url': clusterUrl,
    'Session-Id': sessionID,
  };
  return headers;
};

async function fetchResponse(
  url: RequestInfo | URL,
  headers: Record<string, string>,
  body: string,
  sessionID: string,
  handleChatResponse: { (chunk: MessageChunk): void },
  handleError: { (errResponse: ErrResponse): void },
): Promise<boolean> {
  console.debug('1: Fetch called');
  return fetch(url, {
    headers,
    body,
    method: 'POST',
  })
    .then(async response => {
      if (!response.ok) {
        throw new HttpError('Network response was not ok', response.status);
      }
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get reader from response body');
      }
      const decoder = new TextDecoder();
      await readChunk(
        reader,
        decoder,
        handleChatResponse,
        handleError,
        sessionID,
      );
      return true;
    })
    .catch(error => {
      if (error instanceof HttpError) {
        handleError({
          message: error.message,
          statusCode: error.statusCode,
          type: ErrorType.RETRYABLE,
        });
      } else {
        handleError({
          message: error.message,
          type: ErrorType.FATAL,
        });
      }
      console.error('Error fetching data:', error);
      return false;
    });
}

async function readChunk(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder,
  handleChatResponse: (chunk: MessageChunk) => void,
  handleError: (errResponse: ErrResponse) => void,
  sessionID: string,
): Promise<void> {
  return reader
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
      handleError({
        message: error.message,
        type: ErrorType.FATAL,
      });
      console.error('Error reading stream:', error);
    });
}

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
  const headers = createBasicHeaders(
    certificateAuthorityData,
    clusterUrl,
    sessionID,
  );
  fillAuthHeaders(headers, clusterAuth);

  const fetchWrapper = async function(
    handleResponse: handleChatResponseFn,
    handleError: handleChatErrorResponseFn,
  ): Promise<boolean> {
    return fetchResponse(
      url,
      headers,
      JSON.stringify(payload),
      sessionID,
      handleResponse,
      handleError,
    );
  };

  const result = await retryFetch(
    fetchWrapper,
    handleChatResponse,
    handleError,
    RETRY_DELAY,
    MAX_ATTEMPTS,
  );
  if (!result) {
    handleError({
      message:
        "Couldn't fetch response from Kyma Companion because of network errors.",
      type: ErrorType.FATAL,
    });
  }
}
