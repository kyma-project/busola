import { Button } from '@ui5/webcomponents-react';
import { fireEvent, render, waitFor } from 'testing/reactTestingUtils';
import { useCreateResource } from '../useCreateResource';

import { createPatch } from 'rfc6902';
import { ignoreConsoleErrors } from 'setupTests';
import React from 'react';
import { ErrorDetails } from 'shared/ResourceForm/components/ErrorDetails';

const mockNotifySuccess = vi.fn();
const mockNotifyError = vi.fn();

const errorMessage = 'very specific error message';

vi.mock('shared/contexts/NotificationContext', () => ({
  useNotification: () => ({
    notifySuccess: mockNotifySuccess,
    notifyError: mockNotifyError,
  }),
}));

const mockFetch = vi.fn();
vi.mock('shared/hooks/BackendAPI/useFetch', () => ({
  useFetch: () => mockFetch,
}));

const consoleErrorMock = vi
  .spyOn(console, 'error')
  .mockImplementation(() => vi.fn());

const Testbed = ({ namespace = 'test-namespace', ...props }) => {
  const Component = () => {
    const createResource = useCreateResource(props);
    return <Button onClick={() => createResource()}>Act</Button>;
  };

  return <Component />;
};

describe('useCreateResource', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockNotifySuccess.mockReset();
    mockNotifyError.mockReset();
    consoleErrorMock.mockRestore();
  });

  const props = {
    pluralKind: 'plural-kind-of-resources',
    resource: { metadata: { name: 'test-name' }, spec: {} },
    createUrl: 'mock-create-url',
  };

  it('Fires POST if initial resource UID does not exist', async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({ json: () => Promise.resolve({}) }),
    );
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

  it('Fires PATCH if initial resource UID exists', async () => {
    const initialResource = { metadata: { name: 'test-name', uid: '1234abc' } };
    mockFetch.mockReturnValue(
      Promise.resolve({ json: () => Promise.resolve({}) }),
    );
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
    });
  });

  it('Runs callbacks', async () => {
    // default path: the same as pluralKind
    const { getByText, rerender } = render(<Testbed {...props} />);

    // error
    rerender(<Testbed {...props} />);

    mockFetch.mockImplementationOnce(() => {
      throw Error(errorMessage);
    });

    ignoreConsoleErrors([errorMessage]);

    fireEvent.click(getByText('Act'));

    await waitFor(() => {
      expect(mockNotifySuccess).not.toHaveBeenCalled();
      expect(mockNotifyError).toHaveBeenCalledWith(
        expect.objectContaining({
          content: expect.objectContaining({
            type: ErrorDetails,
            props: expect.objectContaining({
              error: expect.objectContaining({ message: errorMessage }),
            }),
          }),
        }),
      );
    });
  });
});
