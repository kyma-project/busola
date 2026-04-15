import { Button } from '@ui5/webcomponents-react';
import { fireEvent, render, waitFor } from 'testing/reactTestingUtils';
import { useRestartResource } from './useRestartResource';
import { ignoreConsoleWarns } from 'setupTests';

vi.mock('@ui5/webcomponents-react', () => ({
  Button: (props) => <button {...props}>{props.children}</button>,
}));

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

vi.mock('shared/hooks/useProtectedResources', () => ({
  useProtectedResources: () => ({ isProtected: vi.fn() }),
}));

const resource = {
  apiVersion: 'apps/v1',
  kind: 'Deployment',
  metadata: {
    name: 'my-deploy',
    namespace: 'default',
  },
  spec: {
    template: {
      metadata: {
        annotations: {},
      },
    },
  },
};

const Testbed = ({ baseUrl, namespace, resource }) => {
  const Component = () => {
    const restartResource = useRestartResource(baseUrl, namespace);
    return <Button onClick={() => restartResource(resource)}>Restart</Button>;
  };

  return <Component />;
};

describe('useRestartResource', () => {
  const baseUrl = '/apis/apps/v1/namespaces/default/deployments';

  const fixedDate = '2026-01-15T12:00:00.000Z';

  beforeEach(() => {
    mockFetch.mockReset();
    mockNotifySuccess.mockReset();
    mockNotifyError.mockReset();
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue(fixedDate);
  });

  it('Fires PATCH with correct URL and restart annotation', async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({ json: () => Promise.resolve({}) }),
    );
    const { getByText } = render(
      <Testbed baseUrl={baseUrl} namespace="default" resource={resource} />,
    );

    fireEvent.click(getByText('Restart'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          relativeUrl: `${baseUrl}/my-deploy`,
          init: expect.objectContaining({
            method: 'PATCH',
          }),
        }),
      );

      const body = JSON.parse(mockFetch.mock.calls[0][0].init.body);
      const restartOp = body.find(
        (op) =>
          op.path ===
          '/spec/template/metadata/annotations/kubectl.kubernetes.io~1restartedAt',
      );
      expect(restartOp).toBeDefined();
      expect(restartOp.value).toBe(fixedDate);

      expect(mockNotifySuccess).toHaveBeenCalledWith({
        content: 'common.messages.restart-success',
      });
    });
  });

  it('Builds full URL when namespace is "-all-"', async () => {
    mockFetch.mockReturnValue(
      Promise.resolve({ json: () => Promise.resolve({}) }),
    );
    const { getByText } = render(
      <Testbed baseUrl={baseUrl} namespace="-all-" resource={resource} />,
    );

    fireEvent.click(getByText('Restart'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.objectContaining({
          relativeUrl: '/apis/apps/v1/namespaces/default/deployments/my-deploy',
        }),
      );
    });
  });

  it('Shows error notification on failure', async () => {
    ignoreConsoleWarns(['network failure']);

    mockFetch.mockImplementation(() => {
      throw Error('network failure');
    });
    const { getByText } = render(
      <Testbed baseUrl={baseUrl} namespace="default" resource={resource} />,
    );

    fireEvent.click(getByText('Restart'));

    await waitFor(() => {
      expect(mockNotifySuccess).not.toHaveBeenCalled();
      expect(mockNotifyError).toHaveBeenCalledWith({
        title: 'common.messages.restart-failure',
        content: 'common.messages.error',
      });
    });
  });
});
