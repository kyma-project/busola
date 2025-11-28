import {
  ErrResponse,
  HTTPStatus,
  MessageChunk,
} from '../components/Chat/types';

export type handleChatResponseFn = (chunk: MessageChunk) => void;
export type handleChatErrorResponseFn = (errResponse: ErrResponse) => void;
export type fetchFn = (
  handleResponse: handleChatResponseFn,
  handleError: handleChatErrorResponseFn,
) => Promise<boolean>;

export async function retryFetch(
  fetchFn: fetchFn,
  handleChatResponse: handleChatResponseFn,
  handleError: handleChatErrorResponseFn,
  maxAttempts: number,
  retryDelay: number,
): Promise<{ finished: boolean; error: ErrResponse | null }> {
  let finished = false;
  let error: ErrResponse | null = null;
  for (let i = 0; i < maxAttempts; i++) {
    const handleErrWrapper = (errResponse: ErrResponse) => {
      errResponse.maxAttempts =
        errResponse?.statusCode === HTTPStatus.RATE_LIMIT_CODE
          ? 1
          : maxAttempts;
      errResponse.attempt = i + 1;
      handleError(errResponse);
      error = errResponse;
    };
    const handleChatResponseWrapper = (chunk: MessageChunk) => {
      handleChatResponse(chunk);
    };

    finished = await fetchFn(handleChatResponseWrapper, handleErrWrapper);

    if (error?.['statusCode'] === HTTPStatus.RATE_LIMIT_CODE) {
      break;
    } else if (!finished) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    } else {
      finished = true;
      break;
    }
  }
  return { finished, error };
}
