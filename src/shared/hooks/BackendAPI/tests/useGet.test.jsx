import { render, act, waitFor } from 'testing/reactTestingUtils';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { authDataAtom } from 'state/authDataAtom';
import { clusterAtom } from 'state/clusterAtom';

const mockUseFetch = vi.fn();
vi.mock('./../useFetch', () => ({
  useFetch: () => mockUseFetch,
}));

function Testbed({ setGetResult }) {
  const getResult = useGet('/', { pollingInterval: 100 });
  setGetResult(getResult.loading, getResult.error, getResult.data);
  return null;
}

describe('useGet', () => {
  it('Tolerancy', async () => {
    const setGetResultMock = vi.fn();

    mockUseFetch
      .mockImplementationOnce(
        () =>
          Promise.resolve({ json: () => Promise.resolve({ metadata: {} }) }), // loading call
      )
      .mockImplementationOnce(
        () =>
          Promise.resolve({ json: () => Promise.resolve({ metadata: {} }) }), // first valid call
      )
      .mockImplementation(() => {
        throw new Error('2'); // failing calls
      });

    render(<Testbed setGetResult={setGetResultMock} />, {
      initialAtoms: [
        [authDataAtom, { token: 'test-token' }],
        [clusterAtom, {}],
      ],
    });

    // first call - loading
    expect(setGetResultMock).toHaveBeenCalledWith(true, null, null);
    // first call - valid data
    await waitFor(() =>
      expect(setGetResultMock).toHaveBeenCalledWith(
        false,
        null,
        expect.any(Object),
      ),
    );
    // second call - error, but still show data (1/2)
    await waitFor(() =>
      expect(setGetResultMock).toHaveBeenCalledWith(
        false,
        null,
        expect.any(Object),
      ),
    );
    // third call - error, but still show data (2/2)
    await waitFor(() =>
      expect(setGetResultMock).toHaveBeenCalledWith(
        false,
        null,
        expect.any(Object),
      ),
    );
    // fourth call - error, start displaying error
    await waitFor(() =>
      expect(setGetResultMock).toHaveBeenCalledWith(
        false,
        expect.any(Error),
        expect.any(Object),
      ),
    );
  });

  it('keeps delivering fresh data across many poll ticks', async () => {
    // pruning settled entries must not break the staleness check, so every changed response should still reach setData
    const setGetResultMock = vi.fn();

    let version = 0;
    mockUseFetch.mockImplementation(() => {
      version++;
      return Promise.resolve({
        json: () =>
          Promise.resolve({ metadata: { resourceVersion: `${version}` } }),
      });
    });

    render(<Testbed setGetResult={setGetResultMock} />, {
      initialAtoms: [
        [authDataAtom, { token: 'test-token' }],
        [clusterAtom, {}],
      ],
    });

    await waitFor(() =>
      expect(setGetResultMock).toHaveBeenCalledWith(
        false,
        null,
        expect.objectContaining({
          metadata: expect.objectContaining({ resourceVersion: '1' }),
        }),
      ),
    );
    await waitFor(() =>
      expect(setGetResultMock).toHaveBeenCalledWith(
        false,
        null,
        expect.objectContaining({
          metadata: expect.objectContaining({ resourceVersion: '3' }),
        }),
      ),
    );
  });

  it('creates the polling interval only once across many poll ticks', async () => {
    // Regression: the polling effect once depended on `data`/`refetch`, so each
    // poll's new resourceVersion re-armed the interval. It must be created once.
    vi.useFakeTimers();
    // Spy after useFakeTimers (wraps the fake timer) and before render (so the
    // mount-time setInterval is counted).
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
    const setGetResultMock = vi.fn();

    let version = 0;
    mockUseFetch.mockImplementation(() => {
      version++;
      return Promise.resolve({
        json: () =>
          Promise.resolve({ metadata: { resourceVersion: `${version}` } }),
      });
    });

    render(<Testbed setGetResult={setGetResultMock} />, {
      initialAtoms: [
        [authDataAtom, { token: 'test-token' }],
        [clusterAtom, {}],
      ],
    });

    // Drain the initial fetch (0-delay deferrals) without firing the interval.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // 5 poll ticks, each returning a fresh resourceVersion.
    for (let i = 0; i < 5; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });
    }

    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    expect(clearIntervalSpy).not.toHaveBeenCalled();
  });

  it('does not deliver new data on same resourceVersion when compareEntireResource is false', async () => {
    // Regression: a positional-arg mismatch forced `compareEntireResource` truthy,
    // so an unchanged resourceVersion still re-delivered. It must not now.
    vi.useFakeTimers();
    const setGetResultMock = vi.fn();

    let body = 0;
    mockUseFetch.mockImplementation(() => {
      body++;
      return Promise.resolve({
        json: () =>
          Promise.resolve({
            metadata: { resourceVersion: 'v-fixed' },
            body,
          }),
      });
    });

    render(<Testbed setGetResult={setGetResultMock} />, {
      initialAtoms: [
        [authDataAtom, { token: 'test-token' }],
        [clusterAtom, {}],
      ],
    });

    // Drain the initial load (delivers body:1).
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0);
    });

    // 4 poll ticks with the same resourceVersion.
    for (let i = 0; i < 4; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(100);
      });
    }

    const deliveredBodies = setGetResultMock.mock.calls
      .map(([, , data]) => data?.body)
      .filter((b) => b !== undefined);

    // Same resourceVersion → only the initial body reaches state (pre-fix: 2, 3, 4…).
    expect(deliveredBodies.length).toBeGreaterThan(0);
    expect(deliveredBodies.every((b) => b === 1)).toBe(true);
  });
});
