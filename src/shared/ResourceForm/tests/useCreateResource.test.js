import { Button } from '@ui5/webcomponents-react';
import { fireEvent, render, waitFor } from 'testing/reactTestingUtils';
import { useCreateResource } from '../useCreateResource';

import { createPatch } from 'rfc6902';
import { ignoreConsoleErrors } from 'setupTests';

vi.mock('@ui5/webcomponents-react', () => {
  return {
    Button: props => <button {...props}>{props.children}</button>,
  };
});

const mockNotifySuccess = vi.fn();
const mockNotifyError = vi.fn();
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

  it('Fires POST if initial resource name does not exist', async () => {
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

  it('Fires PATCH if initial resource name exists', async () => {
    const initialResource = { metadata: { name: 'test-name' } };
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
      throw Error('very specific error message');
    });

    ignoreConsoleErrors(['very specific error message']);

    fireEvent.click(getByText('Act'));

    await waitFor(() => {
      expect(mockNotifySuccess).not.toHaveBeenCalled();
      expect(mockNotifyError).toHaveBeenCalledWith({
        content: 'common.create-form.messages.create-failure',
      });
    });
  });
});
