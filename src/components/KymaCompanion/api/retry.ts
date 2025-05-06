import {
  ErrorType,
  ErrResponse,
  MessageChunk,
} from 'components/KymaCompanion/components/Chat/Message/Message';

const ERROR_RETRY_TIMEOUT = 1_000;
const MAX_ATTEMPTS = 3;

export type handleChatResponseFn = (chunk: MessageChunk) => void;
export type handleChatErrorResponseFn = (errResponse: ErrResponse) => void;

export async function retryFetch(
  fetchFn: {
    (
      handleResponse: handleChatResponseFn,
      handleError: handleChatErrorResponseFn,
    ): Promise<boolean>;
  },
  handleChatResponse: handleChatResponseFn,
  handleError: handleChatErrorResponseFn,
): Promise<void> {
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
      console.debug('2: Finished reading the answer');
    };

    finished = await fetchFn(handleChatResponseWrapper, handleErrWrapper);

    console.debug('3: Fetch Done');
    if (!finished) {
      await new Promise(resolve => setTimeout(resolve, ERROR_RETRY_TIMEOUT));
    } else {
      console.debug('DONE');
      finished = true;
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
