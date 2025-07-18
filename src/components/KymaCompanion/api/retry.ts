import { ErrResponse, MessageChunk } from '../components/Chat/types';

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
    // eslint-disable-next-line no-loop-func
    const handleErrWrapper = (errResponse: ErrResponse) => {
      errResponse.maxAttempts =
        errResponse?.statusCode === 429 ? 1 : maxAttempts;
      errResponse.attempt = i + 1;
      handleError(errResponse);
      error = errResponse;
      console.debug('2: Finished handling the error', errResponse);
    };
    const handleChatResponseWrapper = (chunk: MessageChunk) => {
      handleChatResponse(chunk);
      console.debug('2: Finished reading the answer');
    };

    finished = await fetchFn(handleChatResponseWrapper, handleErrWrapper);

    console.debug(`3: Fetch Done. Result: ${finished}`);
    if (error?.['statusCode'] === 429) {
      break;
    } else if (!finished) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    } else {
      console.debug('DONE');
      finished = true;
      break;
    }
  }
  return { finished, error };
}
