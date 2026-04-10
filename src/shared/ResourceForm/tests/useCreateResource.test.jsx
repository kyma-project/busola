import { Button, List, Text } from '@ui5/webcomponents-react';
import { fireEvent, render, waitFor } from 'testing/reactTestingUtils';
import { useCreateResource } from '../useCreateResource';

import { createPatch } from 'rfc6902';
import { ignoreConsoleErrors } from 'setupTests';
import React from 'react';

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
      expect(mockNotifyError).toHaveBeenCalled();
      assertNotifyErrorContent(mockNotifyError.mock.calls[0][0]);
    });
  });
});

function assertNotifyErrorContent(callArgs) {
  expect(callArgs.content.type).toBe(React.Fragment);

  const fragmentChildren = callArgs.content.props.children;
  expect(fragmentChildren).toHaveLength(2);

  const textComponent = fragmentChildren[0];
  expect(textComponent.type).toBe(Text);
  expect(textComponent.props.children).toBe(
    'common.create-form.messages.create-failure',
  );

  const listComponent = fragmentChildren[1];
  expect(listComponent.type).toBe(List);

  const listItemStandard = listComponent.props.children;
  expect(listItemStandard.props.text).toBe(errorMessage);
}
