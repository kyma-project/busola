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
): Promise<boolean> {
  let finished = false;
  for (let i = 0; i < maxAttempts; i++) {
    const handleErrWrapper = (errResponse: ErrResponse) => {
      errResponse.maxAttempts = maxAttempts;
      errResponse.attempt = i + 1;
      handleError(errResponse);
      console.debug('2: Finished handling the error', errResponse);
    };
    const handleChatResponseWrapper = (chunk: MessageChunk) => {
      handleChatResponse(chunk);
      console.debug('2: Finished reading the answer');
    };

    finished = await fetchFn(handleChatResponseWrapper, handleErrWrapper);

    console.debug(`3: Fetch Done. Result: ${finished}`);
    if (!finished) {
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    } else {
      console.debug('DONE');
      finished = true;
      break;
    }
  }
  return finished;
}
