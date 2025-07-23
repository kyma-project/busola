import { getClusterConfig } from 'state/utils/getBackendInfo';
import { HttpError, HTTPStatus } from './error';
import {
  handleChatErrorResponseFn,
  handleChatResponseFn,
  retryFetch,
} from 'components/KymaCompanion/api/retry';
import { ErrorType, ErrResponse, MessageChunk } from '../components/Chat/types';
import { TFunction } from 'i18next';

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
  t: TFunction;
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
  return fetch(url, {
    headers,
    body,
    method: 'POST',
  })
    .then(async response => {
      if (!response.ok) {
        const respJson = await response?.json();
        const error = new HttpError(response?.statusText, response?.status);
        error.message = respJson?.message;
        throw error;
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
      if (
        error instanceof HttpError &&
        error.statusCode !== HTTPStatus.RATE_LIMIT_CODE
      ) {
        handleError({
          title: error?.title,
          message: error?.message,
          statusCode: error?.statusCode,
          type: ErrorType.RETRYABLE,
        });
      } else {
        handleError({
          title: error?.title,
          message: error?.message,
          statusCode: error?.statusCode ?? 'unknown',
          maxAttempts:
            error.statusCode === HTTPStatus.RATE_LIMIT_CODE ? 1 : MAX_ATTEMPTS,
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
  buffer: string = '',
): Promise<void> {
  return reader
    .read()
    .then(({ done, value }) => {
      if (done) {
        if (buffer.trim()) {
          handleError({
            message: 'Stream ended with incomplete JSON data',
            type: ErrorType.FATAL,
          });
        }
        return;
      }
      const receivedString = decoder.decode(value, { stream: true });
      const combinedData = buffer + receivedString;
      const { completeObjects, remainingBuffer } = extractJsonObjectsFromChunk(
        combinedData,
      );

      completeObjects.forEach(message => {
        const chunk = JSON.parse(message);
        // Custom error provided by busola backend during streaming, not by companion backend
        if (chunk?.error) {
          throw new Error(chunk?.error);
        }
        handleChatResponse(chunk);
      });

      // Continue reading with the updated buffer
      readChunk(
        reader,
        decoder,
        handleChatResponse,
        handleError,
        sessionID,
        remainingBuffer,
      );
    })
    .catch(error => {
      console.error('Error reading stream:', error);
      handleError({
        message: error.message,
        type: ErrorType.FATAL,
      });
    });
}

function extractJsonObjectsFromChunk(
  text: string,
): { completeObjects: string[]; remainingBuffer: string } {
  const completeObjects: string[] = [];
  let remainingBuffer = text;

  // Look for complete JSON objects (ending with `}}\n`)
  const jsonEndPattern = /\}\}\n/g;
  let match;
  let lastIndex = 0;

  while ((match = jsonEndPattern.exec(text)) !== null) {
    // Extract the complete JSON object (from lastIndex to end of match)
    const completeObject = text.substring(
      lastIndex,
      match.index + match[0].length,
    );

    const trimmedObject = completeObject.trim();
    if (trimmedObject.startsWith('{')) {
      completeObjects.push(trimmedObject.replace(/\n$/, ''));
      lastIndex = match.index + match[0].length;
    }
  }

  // Whatever remains after the last complete object stays in the buffer
  remainingBuffer = text.substring(lastIndex);

  // If we didn't find any complete objects (doesn't end with `}}\n`),
  // store in buffer and wait for the next chunk
  if (
    completeObjects.length === 0 &&
    text.trim() &&
    !text.trim().endsWith('}}\n')
  ) {
    remainingBuffer = text;
  }

  return { completeObjects, remainingBuffer };
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
  t,
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
    MAX_ATTEMPTS,
    RETRY_DELAY,
  );

  if (!result?.finished) {
    handleError({
      title: result?.error?.title,
      message:
        result?.error?.message ||
        t('kyma-companion.error.internal_server_error-message'),
      type: ErrorType.FATAL,
      statusCode: result?.error?.statusCode,
      maxAttempts: result?.error?.maxAttempts,
    });
  }
}
