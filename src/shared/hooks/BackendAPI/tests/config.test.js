import { HttpError, throwHttpError } from '../config';
import { ignoreConsoleWarns } from 'setupTests';

function makeResponse({
  status = 500,
  statusText = '',
  message,
  json,
  text,
} = {}) {
  return {
    status,
    statusText,
    message,
    json: json ?? (() => Promise.reject(new Error('no json'))),
    text: text ?? (() => Promise.reject(new Error('no text'))),
  };
}

describe('HttpError', () => {
  it('masks the message for 401/403 but keeps the original', () => {
    [401, 403].forEach((status) => {
      const error = new HttpError('secret detail', status, status, {
        foo: 'bar',
      });
      expect(error.message).toBe(
        'You are not allowed to perform this operation',
      );
      expect(error.originalMessage).toBe('secret detail');
      expect(error.status).toBe(status);
      expect(error.code).toBe(status);
      expect(error.errorDetails).toEqual({ foo: 'bar' });
    });
  });

  it('keeps the original message for other statuses', () => {
    const error = new HttpError('boom', 500, 12345, null);
    expect(error.message).toBe('boom');
    expect(error.originalMessage).toBe('boom');
    expect(error.status).toBe(500);
    expect(error.code).toBe(12345);
    expect(error.errorDetails).toBeNull();
  });
});

describe('throwHttpError', () => {
  it('maps a JSON error body to an HttpError', async () => {
    const response = makeResponse({
      status: 500,
      json: () =>
        Promise.resolve({
          message: 'something failed',
          status: 'Failure',
          code: 500,
          details: { kind: 'Pod' },
        }),
    });

    const error = await throwHttpError(response);

    expect(error).toBeInstanceOf(HttpError);
    expect(error.message).toBe('something failed');
    expect(error.status).toBe('Failure');
    expect(error.code).toBe(500);
    expect(error.errorDetails).toEqual({ kind: 'Pod' });
  });

  it('masks the message when the body reports a numeric 403 status', async () => {
    const response = makeResponse({
      status: 403,
      json: () =>
        Promise.resolve({
          message: 'forbidden: user cannot list pods',
          status: 403,
          code: 403,
        }),
    });

    const error = await throwHttpError(response);

    expect(error).toBeInstanceOf(HttpError);
    expect(error.code).toBe(403);
    expect(error.message).toBe('You are not allowed to perform this operation');
    expect(error.originalMessage).toBe('forbidden: user cannot list pods');
  });

  it('keeps the message for a k8s 403 body whose status is "Failure"', async () => {
    // Real k8s error bodies carry status: 'Failure' and code: 403, so the
    // status-based masking in the HttpError constructor does not trigger.
    const response = makeResponse({
      status: 403,
      json: () =>
        Promise.resolve({
          message: 'forbidden: user cannot list pods',
          status: 'Failure',
          code: 403,
        }),
    });

    const error = await throwHttpError(response);

    expect(error).toBeInstanceOf(HttpError);
    expect(error.code).toBe(403);
    expect(error.message).toBe('forbidden: user cannot list pods');
  });

  it('falls back to code from response.status when the body has none', async () => {
    const response = makeResponse({
      status: 404,
      json: () => Promise.resolve({ message: 'not found' }),
    });

    const error = await throwHttpError(response);

    expect(error.message).toBe('not found');
    expect(error.code).toBe(404);
  });

  it('defaults the message to "Unknown error" for an empty JSON body', async () => {
    const response = makeResponse({
      status: 500,
      json: () => Promise.resolve({}),
    });

    const error = await throwHttpError(response);

    expect(error.message).toBe('Unknown error');
    expect(error.code).toBe(500);
  });

  it('falls back to response text when the body is not JSON', async () => {
    ignoreConsoleWarns(['Failed to parse error response as JSON']);

    const response = makeResponse({
      status: 502,
      text: () => Promise.resolve('Bad Gateway from proxy'),
    });

    const error = await throwHttpError(response);

    expect(error).toBeInstanceOf(Error);
    expect(error).not.toBeInstanceOf(HttpError);
    expect(error.message).toBe('Bad Gateway from proxy');
  });

  it('marks a 404 with an unreadable body as "Definition not found"', async () => {
    ignoreConsoleWarns([
      'Failed to parse error response as JSON',
      'Failed to parse error response as text',
    ]);

    const response = makeResponse({
      status: 404,
      statusText: 'Not Found',
      message: '',
    });

    const error = await throwHttpError(response);

    expect(error).toBeInstanceOf(HttpError);
    expect(error.status).toBe('Definition not found');
    expect(error.code).toBe(404);
    expect(error.message).toBe('404 Not Found');
  });

  it('builds a message from status + reason phrase for a non-404 unreadable body', async () => {
    ignoreConsoleWarns([
      'Failed to parse error response as JSON',
      'Failed to parse error response as text',
    ]);

    const response = makeResponse({
      status: 500,
      statusText: '',
      message: '',
    });

    const error = await throwHttpError(response);

    expect(error).toBeInstanceOf(HttpError);
    // getReasonPhrase(500) resolves to 'Internal Server Error'
    expect(error.message).toBe('500 Internal Server Error');
    expect(error.status).toBe('');
    expect(error.code).toBe(500);
  });
});
