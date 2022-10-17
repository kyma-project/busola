import { fireEvent, render, waitFor } from '@testing-library/react';
import { useCreateResource } from '../useCreateResource';

import { createPatch } from 'rfc6902';
import { MicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import { ignoreConsoleErrors } from 'setupTests';

const mockNotifySuccess = jest.fn();
const mockNotifyError = jest.fn();
jest.mock('shared/contexts/NotificationContext', () => ({
  useNotification: () => ({
    notifySuccess: mockNotifySuccess,
    notifyError: mockNotifyError,
  }),
}));

const mockFetch = jest.fn();
jest.mock('shared/hooks/BackendAPI/useFetch', () => ({
  useFetch: () => mockFetch,
}));

const mockNavigateToResourceAfterCreate = jest.fn();
jest.mock('shared/hooks/navigate', () => ({
  navigateToResourceAfterCreate: (...args) =>
    mockNavigateToResourceAfterCreate(args),
}));

const consoleErrorMock = jest
  .spyOn(console, 'error')
  .mockImplementation(() => jest.fn());

const Testbed = ({ namespace = 'test-namespace', ...props }) => {
  const Component = () => {
    const createResource = useCreateResource(props);
    return <button onClick={() => createResource()}>Act</button>;
  };

  return (
    <MicrofrontendContext.Provider value={{ namespaceId: namespace }}>
      <Component />
    </MicrofrontendContext.Provider>
  );
};

describe('useCreateResource', () => {
  beforeEach(() => {
    mockFetch.mockReturnValue(
      Promise.resolve({ json: () => Promise.resolve({}) }),
    );
    consoleErrorMock.mockRestore();
  });

  const props = {
    pluralKind: 'plural-kind-of-resources',
    resource: { metadata: { name: 'test-name' }, spec: {} },
    createUrl: 'mock-create-url',
  };

  it('Fires POST if initial resource name does not exist', async () => {
    const { getByText } = render(<Testbed {...props} />);

    fireEvent.click(getByText('Act'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          init: expect.objectContaining({
            body: JSON.stringify(props.resource),
            method: 'POST',
          }),
          relativeUrl: props.createUrl,
        }),
      );

      expect(mockNotifySuccess).toHaveBeenCalledWith({
        content: 'common.create-form.messages.create-success',
      });
    });
  });

  it('Fires PATCH if initial resource name exists', async () => {
    const initialResource = { metadata: { name: 'test-name' } };
    const { getByText } = render(
      <Testbed {...props} initialResource={initialResource} />,
    );

    fireEvent.click(getByText('Act'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          init: expect.objectContaining({
            body: JSON.stringify(createPatch(initialResource, props.resource)),
            method: 'PATCH',
          }),
          relativeUrl: props.createUrl,
        }),
      );
      expect(mockNotifySuccess).toHaveBeenCalledWith({
        content: 'common.create-form.messages.patch-success',
      });
      expect(mockNavigateToResourceAfterCreate).not.toHaveBeenCalled();
    });
  });

  it('Runs callbacks', async () => {
    // default path: the same as pluralKind
    const { getByText, rerender } = render(<Testbed {...props} />);

    // error
    rerender(<Testbed {...props} />);

    mockFetch.mockImplementationOnce(() => {
      throw Error('very specific error message');
    });

    ignoreConsoleErrors(['very specific error message']);

    fireEvent.click(getByText('Act'));

    await waitFor(() => {
      expect(mockNotifySuccess).not.toHaveBeenCalled();
      expect(mockNotifyError).toHaveBeenCalledWith({
        content: 'common.create-form.messages.create-failure',
      });
      expect(mockNavigateToResourceAfterCreate).not.toHaveBeenCalled();
    });
  });
});
