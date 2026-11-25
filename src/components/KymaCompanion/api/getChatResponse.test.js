import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import getChatResponse, {
  extractJsonObjectsFromChunk,
  readChunk,
} from './getChatResponse';
import { ErrorType } from '../components/Chat/types';

describe('readChunk', () => {
  const decoder = new TextDecoder();
  const sessionID = 'test-session';

  it('handles an entire JSON object in a single chunk', async () => {
    const handleChatResponse = vi.fn();
    const handleError = vi.fn();

    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('{"a": {"b": "c"}}\n'),
        })
        .mockResolvedValueOnce({ done: true }),
    };

    await readChunk(
      mockReader,
      decoder,
      handleChatResponse,
      handleError,
      sessionID,
    );

    expect(handleChatResponse).toHaveBeenCalledTimes(1);
    expect(handleChatResponse).toHaveBeenCalledWith({ a: { b: 'c' } });
    expect(handleError).not.toHaveBeenCalled();
  });

  it('handles two entire JSON objects in a single chunk', async () => {
    const handleChatResponse = vi.fn();
    const handleError = vi.fn();

    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode(
            '{"a": {"b": "c"}}\n{"d": {"e": "f"}}\n',
          ),
        })
        .mockResolvedValueOnce({ done: true }),
    };

    await readChunk(
      mockReader,
      decoder,
      handleChatResponse,
      handleError,
      sessionID,
    );

    expect(handleChatResponse).toHaveBeenCalledTimes(2);
    expect(handleChatResponse).toHaveBeenCalledWith({ a: { b: 'c' } });
    expect(handleChatResponse).toHaveBeenCalledWith({ d: { e: 'f' } });
    expect(handleError).not.toHaveBeenCalled();
  });

  it('handles a partial JSON object split across two chunks', async () => {
    const handleChatResponse = vi.fn();
    const handleError = vi.fn();

    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('{"a": {"b": "c"'),
        })
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('}}\n'),
        })
        .mockResolvedValueOnce({ done: true }),
    };

    await readChunk(
      mockReader,
      decoder,
      handleChatResponse,
      handleError,
      sessionID,
    );

    expect(handleChatResponse).toHaveBeenCalledTimes(1);
    expect(handleChatResponse).toHaveBeenCalledWith({ a: { b: 'c' } });
    expect(handleError).not.toHaveBeenCalled();
  });

  it('handles one entire and one partial JSON object in one chunk with completion in the next', async () => {
    const handleChatResponse = vi.fn();
    const handleError = vi.fn();

    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('{"a": {"b": "c"}}\n{"d": {"e": "f"'),
        })
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('}}\n'),
        })
        .mockResolvedValueOnce({ done: true }),
    };

    await readChunk(
      mockReader,
      decoder,
      handleChatResponse,
      handleError,
      sessionID,
    );

    expect(handleChatResponse).toHaveBeenCalledTimes(2);
    expect(handleChatResponse).toHaveBeenCalledWith({ a: { b: 'c' } });
    expect(handleChatResponse).toHaveBeenCalledWith({ d: { e: 'f' } });
    expect(handleError).not.toHaveBeenCalled();
  });

  it('handles stream ending with incomplete JSON data', async () => {
    const handleChatResponse = vi.fn();
    const handleError = vi.fn();

    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode('{"a": {"b": "c"'),
        })
        .mockResolvedValueOnce({ done: true }),
    };

    await readChunk(
      mockReader,
      decoder,
      handleChatResponse,
      handleError,
      sessionID,
    );

    expect(handleChatResponse).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith({
      message: 'Stream ended with incomplete JSON data',
      type: ErrorType.FATAL,
    });
  });

  it('handles JSON chunk with error', async () => {
    const handleChatResponse = vi.fn();
    const handleError = vi.fn();

    const mockReader = {
      read: vi
        .fn()
        .mockResolvedValueOnce({
          done: false,
          value: new TextEncoder().encode(
            '{"streamingError": {"message": "test message" }}\n',
          ),
        })
        .mockResolvedValueOnce({ done: true }),
    };

    await readChunk(
      mockReader,
      decoder,
      handleChatResponse,
      handleError,
      sessionID,
    );

    expect(handleChatResponse).not.toHaveBeenCalled();
    expect(handleError).toHaveBeenCalledWith({
      message: 'test message',
      type: ErrorType.FATAL,
    });
  });
});

describe('extractJsonObjectsFromChunk', () => {
  it('extracts entire JSON object', () => {
    const input = '{"a": {"b": "c"}}\n';
    const result = extractJsonObjectsFromChunk(input);
    expect(result.completeObjects).toEqual(['{"a": {"b": "c"}}']);
    expect(result.remainingBuffer).toBe('');
  });

  it('extracts two entire JSON objects', () => {
    const input = '{"a": {"b": "c"}}\n{"d": {"e": "f"}}\n';
    const result = extractJsonObjectsFromChunk(input);
    expect(result.completeObjects).toEqual([
      '{"a": {"b": "c"}}',
      '{"d": {"e": "f"}}',
    ]);
    expect(result.remainingBuffer).toBe('');
  });

  it('handles partial JSON object', () => {
    const input = '{"a": {"b": "';
    const result = extractJsonObjectsFromChunk(input);
    expect(result.completeObjects).toEqual([]);
    expect(result.remainingBuffer).toBe('{"a": {"b": "');
  });

  it('extracts one entire and one partial JSON object', () => {
    const input = '{"a": {"b": "c"}}\n{"d": {"e": "';
    const result = extractJsonObjectsFromChunk(input);
    expect(result.completeObjects).toEqual(['{"a": {"b": "c"}}']);
    expect(result.remainingBuffer).toBe('{"d": {"e": "');
  });

  it('extracts multiple JSON objects with a partial object', () => {
    const input = '{"a": {"b": "c"}}\n{"d": {"e": "f"}}\n{"g": {"h": "';
    const result = extractJsonObjectsFromChunk(input);
    expect(result.completeObjects).toEqual([
      '{"a": {"b": "c"}}',
      '{"d": {"e": "f"}}',
    ]);
    expect(result.remainingBuffer).toBe('{"g": {"h": "');
  });

  it('handles JSON object with internal newlines', () => {
    const input = '{"a": {\n  "b": "c"\n}}\n';
    const result = extractJsonObjectsFromChunk(input);
    expect(result.completeObjects).toEqual(['{"a": {\n  "b": "c"\n}}']);
    expect(result.remainingBuffer).toBe('');
  });
});

describe('getChatResponse', () => {
  const RETRY_DELAY = 1_000;
  const fetchMock = vi.fn();
  const handleChatResponse = vi.fn();
  const handleError = vi.fn();
  const t = (key) => key;

  const args = {
    query: 'Why is my pod failing?',
    resourceType: 'Pod',
    sessionID: 'session-1',
    handleChatResponse,
    handleError,
    clusterUrl: 'https://api.cluster.example',
    clusterAuth: { token: 'cluster-token' },
    certificateAuthorityData: 'ca-data',
    t,
  };

  const streamResponse = (...chunks) => {
    const read = vi.fn();
    chunks.forEach((chunk) =>
      read.mockResolvedValueOnce({
        done: false,
        value: new TextEncoder().encode(chunk),
      }),
    );
    read.mockResolvedValue({ done: true });
    return { ok: true, body: { getReader: () => ({ read }) } };
  };

  const errorResponse = (status, body) => ({
    ok: false,
    status,
    json: async () => body,
  });

  const runWithRetries = async (overrides = {}) => {
    const promise = getChatResponse({ ...args, ...overrides });
    await vi.advanceTimersByTimeAsync(3 * RETRY_DELAY);
    await promise;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('rejects without calling the backend when no credentials are given', async () => {
    await expect(getChatResponse({ ...args, clusterAuth: {} })).rejects.toThrow(
      'Missing authentication credentials',
    );
    await expect(
      getChatResponse({
        ...args,
        clusterAuth: { clientCertificateData: 'cert' },
      }),
    ).rejects.toThrow('Missing authentication credentials');
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts the query and streams the answer to the response handler', async () => {
    fetchMock.mockResolvedValue(
      streamResponse('{"data": {"answer": {"content": "Hi"}}}\n'),
    );

    await getChatResponse({
      ...args,
      namespace: 'default',
      groupVersion: 'v1',
      resourceName: 'my-pod',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/backend/ai-chat/messages');
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({
      query: 'Why is my pod failing?',
      namespace: 'default',
      resourceType: 'Pod',
      groupVersion: 'v1',
      resourceName: 'my-pod',
      clusterUrl: 'https://api.cluster.example',
      certificateAuthorityData: 'ca-data',
      sessionId: 'session-1',
      clusterToken: 'cluster-token',
    });
    expect(handleChatResponse).toHaveBeenCalledWith({
      data: { answer: { content: 'Hi' } },
    });
    expect(handleError).not.toHaveBeenCalled();
  });

  it('accepts a client certificate pair and defaults the optional fields', async () => {
    fetchMock.mockResolvedValue(streamResponse());

    await getChatResponse({
      ...args,
      clusterAuth: { clientCertificateData: 'cert', clientKeyData: 'key' },
    });

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toMatchObject({
      namespace: '',
      groupVersion: '',
      resourceName: '',
      clientCertificateData: 'cert',
      clientKeyData: 'key',
    });
    expect(body).not.toHaveProperty('clusterToken');
    expect(handleError).not.toHaveBeenCalled();
  });

  it('reports a server error as retryable and gives up with a fatal error', async () => {
    fetchMock.mockResolvedValue(
      errorResponse(500, { error: 'Internal', message: 'boom' }),
    );

    await runWithRetries();

    expect(handleError).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        title: 'Internal',
        message: 'boom',
        statusCode: 500,
        type: ErrorType.RETRYABLE,
      }),
    );
    expect(handleError).toHaveBeenLastCalledWith({
      title: 'Internal',
      message: 'boom',
      type: ErrorType.FATAL,
      statusCode: 500,
      maxAttempts: 3,
    });
    expect(handleChatResponse).not.toHaveBeenCalled();
  });

  it('reports the rate limit as a fatal error that is not retried', async () => {
    fetchMock.mockResolvedValue(
      errorResponse(429, { error: 'Rate limit', message: 'Too many requests' }),
    );

    await getChatResponse(args);

    expect(handleError).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        title: 'Rate limit',
        message: 'Too many requests',
        statusCode: 429,
        type: ErrorType.FATAL,
        maxAttempts: 1,
      }),
    );
  });

  it('reports a network failure as a fatal error with an unknown status', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await runWithRetries();

    expect(handleError).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        message: 'Failed to fetch',
        statusCode: 'unknown',
        type: ErrorType.FATAL,
      }),
    );
  });

  it('reports a fatal error when the response has no readable body', async () => {
    fetchMock.mockResolvedValue({ ok: true, body: null });

    await runWithRetries();

    expect(handleError).toHaveBeenLastCalledWith(
      expect.objectContaining({
        message: 'Failed to get reader from response body',
        type: ErrorType.FATAL,
      }),
    );
  });

  it('falls back to a translated message when the error has none', async () => {
    fetchMock.mockRejectedValue(new Error(''));

    await runWithRetries();

    expect(handleError).toHaveBeenLastCalledWith(
      expect.objectContaining({
        message: 'kyma-companion.error.internal_server_error-message',
        type: ErrorType.FATAL,
      }),
    );
  });
});
