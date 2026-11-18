import { describe, expect, it, vitest } from 'vitest';

import {
  fetchFn,
  handleChatErrorResponseFn,
  handleChatResponseFn,
  retryFetch,
} from 'components/KymaCompanion/api/retry';
import {
  ErrorType,
  ErrResponse,
  HTTPStatus,
  MessageChunk,
} from '../components/Chat/types';

const successCall = 'Success';
const errorCall = 'Attempt Failed';

const MAX_ATTEMPTS = 3;
const RETRY_DELAY = 1;

describe('Retry mechanism', () => {
  it('Success at first attempt', async () => {
    //GIVEN
    const { fetchFn, handleSuccess, handleError } = createFunctions(0);

    //WHEN
    const result = await retryFetch(
      fetchFn,
      handleSuccess,
      handleError,
      MAX_ATTEMPTS,
      RETRY_DELAY,
    );

    //THEN
    expect(handleSuccess).toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledTimes(0);
    expect(result?.finished).toBeTruthy();
  });

  it('Success at third attempt', async () => {
    //GIVEN
    const { fetchFn, handleSuccess, handleError } = createFunctions(2);

    //WHEN
    const result = await retryFetch(
      fetchFn,
      handleSuccess,
      handleError,
      MAX_ATTEMPTS,
      RETRY_DELAY,
    );

    //THEN
    expect(handleSuccess).toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledTimes(2);
    expect(result?.finished).toBeTruthy();
  });

  it('All attempts failed', async () => {
    //GIVEN
    const { fetchFn, handleSuccess, handleError } = createFunctions(3);

    //WHEN
    const result = await retryFetch(
      fetchFn,
      handleSuccess,
      handleError,
      MAX_ATTEMPTS,
      RETRY_DELAY,
    );

    //THEN
    expect(handleError).toHaveBeenCalledTimes(3);
    expect(handleSuccess).toHaveBeenCalledTimes(0);
    expect(result?.finished).toBeFalsy();
  });

  it('Reports the attempt number and the attempt limit with each error', async () => {
    //GIVEN
    const { fetchFn, handleSuccess, handleError } = createFunctions(2);

    //WHEN
    await retryFetch(
      fetchFn,
      handleSuccess,
      handleError,
      MAX_ATTEMPTS,
      RETRY_DELAY,
    );

    //THEN
    expect(handleError).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ attempt: 1, maxAttempts: MAX_ATTEMPTS }),
    );
    expect(handleError).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ attempt: 2, maxAttempts: MAX_ATTEMPTS }),
    );
  });

  it('Stops after the first attempt when the rate limit is hit', async () => {
    //GIVEN
    const handleSuccess = vitest.fn();
    const handleError = vitest.fn();
    const fetchFn = vitest.fn<fetchFn>(async (_, handleError) => {
      handleError({
        message: errorCall,
        type: ErrorType.FATAL,
        statusCode: HTTPStatus.RATE_LIMIT_CODE,
      });
      return false;
    });

    //WHEN
    const result = await retryFetch(
      fetchFn,
      handleSuccess,
      handleError,
      MAX_ATTEMPTS,
      RETRY_DELAY,
    );

    //THEN
    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(handleError).toHaveBeenCalledTimes(1);
    expect(handleError).toHaveBeenCalledWith(
      expect.objectContaining({ attempt: 1, maxAttempts: 1 }),
    );
    expect(result.finished).toBeFalsy();
    expect(result.error?.statusCode).toEqual(HTTPStatus.RATE_LIMIT_CODE);
  });
});

function createFunctions(failedAttempt: number) {
  const handleSuccess = vitest.fn((chunk: MessageChunk) => {
    expect(chunk.data.answer.content).toEqual(successCall);
  });
  const handleError = vitest.fn((errResponse: ErrResponse) => {
    expect(errResponse.message).toEqual(errorCall);
  });
  const fetchFn = vitest.fn(createFetchFunction(failedAttempt));

  return { fetchFn, handleSuccess, handleError };
}

function createFetchFunction(failedAttempts: number): fetchFn {
  const fetchFnFactory = (): fetchFn => {
    let called = 0;
    return async function (
      handleSuccess: handleChatResponseFn,
      handleError: handleChatErrorResponseFn,
    ) {
      called += 1;
      if (failedAttempts < called) {
        handleSuccess({
          data: { answer: { content: successCall, next: 'next' } },
        });
        return true;
      } else {
        handleError({ message: errorCall, type: ErrorType.RETRYABLE });
        return false;
      }
    };
  };
  return fetchFnFactory();
}
