import { render, waitFor } from 'testing/reactTestingUtils';
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
});
