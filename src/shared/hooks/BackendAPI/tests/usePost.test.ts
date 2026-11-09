import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPostFn } from '../usePost';

const mockFetch = vi.fn();

beforeEach(() => {
  mockFetch.mockReset();
});

describe('createPostFn', () => {
  it('sends a POST with json content type and returns parsed json', async () => {
    const responseBody = { metadata: { name: 'created' } };
    mockFetch.mockResolvedValue({ json: () => Promise.resolve(responseBody) });

    const post = createPostFn(mockFetch);
    const resource = { kind: 'Pod', metadata: { name: 'created' } };
    const returned = await post('/api/v1/namespaces/default/pods', resource);

    expect(returned).toEqual(responseBody);
    expect(mockFetch).toHaveBeenCalledWith({
      relativeUrl: '/api/v1/namespaces/default/pods',
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(resource),
      },
    });
  });

  it('calls options.refetch after a successful request', async () => {
    mockFetch.mockResolvedValue({ json: () => Promise.resolve({}) });
    const refetch = vi.fn();

    const post = createPostFn(mockFetch);
    await post('/url', {}, { refetch });

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('propagates errors from the fetch layer and skips refetch', async () => {
    const error = new Error('You are not allowed to perform this operation');
    mockFetch.mockRejectedValue(error);
    const refetch = vi.fn();

    const post = createPostFn(mockFetch);

    await expect(post('/url', {}, { refetch })).rejects.toBe(error);
    expect(refetch).not.toHaveBeenCalled();
  });
});
