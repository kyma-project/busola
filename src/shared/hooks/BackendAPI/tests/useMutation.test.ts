import { renderHook } from '@testing-library/react';
import { useUpdate, useDelete } from '../useMutation';

const mockFetch = vi.fn();
vi.mock('shared/hooks/BackendAPI/useFetch', () => ({
  useFetch: () => mockFetch,
}));

beforeEach(() => {
  mockFetch.mockReset();
});

describe('useUpdate', () => {
  it('sends a PATCH with the json-patch content type and returns parsed json', async () => {
    const responseBody = { metadata: { name: 'updated' } };
    mockFetch.mockResolvedValue({ json: () => Promise.resolve(responseBody) });

    const { result } = renderHook(() => useUpdate());
    const patch = [{ op: 'replace', path: '/spec/replicas', value: 3 }];
    const returned = await result.current(
      '/apis/apps/v1/deployments/foo',
      patch,
    );

    expect(returned).toEqual(responseBody);
    expect(mockFetch).toHaveBeenCalledWith({
      relativeUrl: '/apis/apps/v1/deployments/foo',
      init: {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json-patch+json',
        },
        body: JSON.stringify(patch),
      },
    });
  });

  it('calls options.refetch after a successful request', async () => {
    mockFetch.mockResolvedValue({ json: () => Promise.resolve({}) });
    const refetch = vi.fn();

    const { result } = renderHook(() => useUpdate({ refetch }));
    await result.current('/url', []);

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('propagates fetch errors and does not call refetch', async () => {
    const error = new Error('You are not allowed to perform this operation');
    mockFetch.mockRejectedValue(error);
    const refetch = vi.fn();

    const { result } = renderHook(() => useUpdate({ refetch }));

    await expect(result.current('/url', [])).rejects.toBe(error);
    expect(refetch).not.toHaveBeenCalled();
  });
});

describe('useDelete', () => {
  it('sends a DELETE and returns parsed json', async () => {
    const responseBody = { status: 'Success' };
    mockFetch.mockResolvedValue({ json: () => Promise.resolve(responseBody) });

    const { result } = renderHook(() => useDelete());
    const returned = await result.current(
      '/api/v1/namespaces/default/pods/foo',
    );

    expect(returned).toEqual(responseBody);
    expect(mockFetch).toHaveBeenCalledWith({
      relativeUrl: '/api/v1/namespaces/default/pods/foo',
      init: {
        method: 'DELETE',
        headers: { Accept: 'application/json' },
        body: undefined,
      },
    });
  });

  it('propagates a 404 error from the fetch layer', async () => {
    const error = new Error('Definition not found');
    mockFetch.mockRejectedValue(error);

    const { result } = renderHook(() => useDelete());

    await expect(result.current('/api/v1/pods/missing')).rejects.toBe(error);
  });
});
