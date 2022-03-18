import React from 'react';
import { render } from '@testing-library/react';
import { useGet } from './../useGet';
import { MicrofrontendContext, ConfigContext } from '../../..';
import wait from 'waait';
import { act } from 'react-dom/test-utils';

const mockUseFetch = jest.fn();
jest.mock('./../useFetch', () => ({
  useFetch: () => mockUseFetch,
}));

function Testbed({ setGetResult }) {
  const getResult = useGet('/', { pollingInterval: 100 });
  setGetResult(getResult.loading, getResult.error, getResult.data);
  return null;
}

function MockContext({ children }) {
  return (
    <ConfigContext.Provider value={{ fromConfig: key => key }}>
      <MicrofrontendContext.Provider
        value={{ authData: { token: 'test-token' }, cluster: {}, config: {} }}
      >
        {children}
      </MicrofrontendContext.Provider>
    </ConfigContext.Provider>
  );
}

describe('useGet', () => {
  it.skip('Tolerancy', async () => {
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
    render(
      <MockContext>
        <Testbed setGetResult={mock} />
      </MockContext>,
    );
    await act(async () => {
      // first call - loading
      expect(mock).toHaveBeenCalledWith(true, null, null);
      await wait(150);
      // first call - valid data
      expect(mock).toHaveBeenCalledWith(false, null, expect.any(Object));
      // second call - error, but still show data (1/2)
      await wait(100);
      expect(mock).toHaveBeenCalledWith(false, null, expect.any(Object));
      // third call - error, but still show data (2/2)
      await wait(100);
      expect(mock).toHaveBeenCalledWith(false, null, expect.any(Object));
      // fourth call - error, start displaying error
      await wait(100);
      expect(mock).toHaveBeenCalledWith(
        false,
        expect.any(Error),
        expect.any(Object),
      );
    });
  });
});
