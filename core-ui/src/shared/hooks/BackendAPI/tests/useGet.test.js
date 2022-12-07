import React from 'react';
import { render, waitFor, act } from 'testing/reactTestingUtils';
import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { authDataState } from 'state/authDataAtom';
import { clusterState } from 'state/clusterAtom';

const mockUseFetch = jest.fn();
jest.mock('./../useFetch', () => ({
  useFetch: () => mockUseFetch,
}));

function Testbed({ setGetResult }) {
  const getResult = useGet('/', { pollingInterval: 100 });
  setGetResult(getResult.loading, getResult.error, getResult.data);
  return null;
}

describe('useGet', () => {
  it('Tolerancy', async () => {
    const mock = jest.fn();

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
    render(<Testbed setGetResult={mock} />, {
      initializeState: snapshot => {
        snapshot.set(authDataState, { token: 'test-token' });
        snapshot.set(clusterState, {});
      },
    });
    await act(async () => {
      // first call - loading
      expect(mock).toHaveBeenCalledWith(true, null, null);
      // first call - valid data
      await waitFor(() =>
        expect(mock).toHaveBeenCalledWith(false, null, expect.any(Object)),
      );
      // second call - error, but still show data (1/2)
      await waitFor(() =>
        expect(mock).toHaveBeenCalledWith(false, null, expect.any(Object)),
      );
      // third call - error, but still show data (2/2)
      await waitFor(() =>
        expect(mock).toHaveBeenCalledWith(false, null, expect.any(Object)),
      );
      // fourth call - error, start displaying error
      await waitFor(() =>
        expect(mock).toHaveBeenCalledWith(
          false,
          expect.any(Error),
          expect.any(Object),
        ),
      );
    });
  });
});
