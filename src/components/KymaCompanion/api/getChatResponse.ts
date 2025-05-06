import { getClusterConfig } from 'state/utils/getBackendInfo';
import {
  ErrorType,
  ErrResponse,
  MessageChunk,
} from '../components/Chat/Message/Message';
import { HttpError } from './error';

const ERROR_RETRY_TIMEOUT = 1_000;
const MAX_ATTEMPTS = 3;

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
  handleError: (errResponse: ErrResponse) => void;
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

  let finished = false;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const handleErrWrapper = (errResponse: ErrResponse) => {
      errResponse.maxAttempts = MAX_ATTEMPTS;
      errResponse.attempt = i + 1;
      handleError(errResponse);
      console.debug('2: Finished handling the error', errResponse);
    };
    const handleChatResponseWrapper = (chunk: MessageChunk) => {
      handleChatResponse(chunk);
      finished = true;
      console.debug('2: Finished reading the answer');
    };

    await fetchResponse(
      url,
      headers,
      JSON.stringify(payload),
      sessionID,
      handleChatResponseWrapper,
      handleErrWrapper,
    );

    console.debug('3: Fetch Done');
    if (!finished) {
      await new Promise(resolve => setTimeout(resolve, ERROR_RETRY_TIMEOUT));
    } else {
      console.debug('DONE');
      break;
    }
  }
  if (!finished) {
    handleError({
      message:
        "Couldn't fetch response from Kyma Companion because of network errors.",
      type: ErrorType.FATAL,
    });
  }
}

async function fetchResponse(
  url: RequestInfo | URL,
  headers: Record<string, string>,
  body: string,
  sessionID: string,
  handleChatResponse: { (chunk: MessageChunk): void },
  handleError: { (errResponse: ErrResponse): void },
): Promise<void> {
  console.debug('1: Fetch Response', new Date());
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
