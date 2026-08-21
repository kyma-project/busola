import { renderHook } from '@testing-library/react';
import { useUpsert } from '../useUpsert';

const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockFetch = vi.fn();

vi.mock('../usePost', () => ({ usePost: () => mockPost }));
vi.mock('../useMutation', () => ({ useUpdate: () => mockPatch }));
vi.mock('../useFetch', () => ({ useFetch: () => mockFetch }));

const url = '/apis/apps/v1/namespaces/default/deployments';

beforeEach(() => {
  mockPost.mockReset();
  mockPatch.mockReset();
  mockFetch.mockReset();
});

describe('useUpsert', () => {
  it('patches an already existing resource with an rfc6902 diff', async () => {
    const existing = {
      metadata: { name: 'foo' },
      spec: { replicas: 1 },
    };
    const resource = {
      metadata: { name: 'foo' },
      spec: { replicas: 3 },
    };
    mockFetch.mockResolvedValue(existing);
    mockPatch.mockResolvedValue({});
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() => useUpsert());
    await result.current({ url, resource, onSuccess, onError });

    expect(mockFetch).toHaveBeenCalledWith({ relativeUrl: `${url}/foo` });
    expect(mockPatch).toHaveBeenCalledWith(
      `${url}/foo`,
      expect.arrayContaining([
        expect.objectContaining({
          op: 'replace',
          path: '/spec/replicas',
          value: 3,
        }),
      ]),
    );
    expect(mockPost).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it('creates the resource when it does not exist yet', async () => {
    const resource = { metadata: { name: 'new-one' }, spec: {} };
    mockFetch.mockRejectedValue(new Error('Definition not found'));
    mockPost.mockResolvedValue({});
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() => useUpsert());
    await result.current({ url, resource, onSuccess, onError });

    expect(mockPost).toHaveBeenCalledWith(url, resource);
    expect(mockPatch).not.toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(onError).not.toHaveBeenCalled();
  });

  it('invokes onError when the write fails', async () => {
    const resource = { metadata: { name: 'new-one' }, spec: {} };
    mockFetch.mockRejectedValue(new Error('not found'));
    const writeError = new Error(
      'You are not allowed to perform this operation',
    );
    mockPost.mockRejectedValue(writeError);
    const onSuccess = vi.fn();
    const onError = vi.fn();

    const { result } = renderHook(() => useUpsert());
    await result.current({ url, resource, onSuccess, onError });

    expect(onError).toHaveBeenCalledWith(writeError);
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
