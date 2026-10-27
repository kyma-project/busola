import { act, renderHook } from '@testing-library/react';
import { Provider, useAtomValue, useSetAtom } from 'jotai';
import { MemoryRouter } from 'react-router';
import { JotaiHydrator } from 'testing/reactTestingUtils';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import { useDeleteResource } from '../useDeleteResource';

const mockDelete = vi.fn();
vi.mock('shared/hooks/BackendAPI/useMutation', () => ({
  useDelete: () => mockDelete,
}));

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
}));

vi.mock('shared/contexts/NotificationContext', () => ({
  useNotification: () => ({ notifySuccess: vi.fn(), notifyError: vi.fn() }),
}));

vi.mock('hooks/useUrl', () => ({
  useUrl: () => ({ resourceListUrl: () => '/pods' }),
}));

const pod = { kind: 'Pod', metadata: { name: 'pod-a', namespace: 'default' } };

const initialLayout = {
  layout: 'ThreeColumnsEndExpanded',
  startColumn: { resourceType: 'Deployments', resourceName: null },
  midColumn: { resourceType: 'Deployment', resourceName: 'deploy-a' },
  endColumn: {
    resourceType: 'Pod',
    resourceName: 'pod-a',
    namespaceId: 'default',
  },
  showCreate: null,
  showEdit: null,
};

const wrapper = ({ children }) => (
  <Provider>
    <JotaiHydrator initialValues={[[columnLayoutAtom, initialLayout]]}>
      <MemoryRouter>{children}</MemoryRouter>
    </JotaiHydrator>
  </Provider>
);

// Starts deleting pod-a from the end column; the request stays pending until finishDelete().
function startDelete() {
  window.history.replaceState(
    {},
    '',
    '/deployments/deploy-a/pod-a?layout=ThreeColumnsEndExpanded',
  );
  let resolveDelete;
  mockDelete.mockReturnValue(new Promise((r) => (resolveDelete = r)));

  const { result } = renderHook(
    () => ({
      ...useDeleteResource({
        resourceType: 'Pods',
        layoutNumber: 'endColumn',
      }),
      layout: useAtomValue(columnLayoutAtom),
      setLayout: useSetAtom(columnLayoutAtom),
    }),
    { wrapper },
  );

  let pending;
  act(() => {
    pending = result.current.performDelete(pod, '/api/v1/pods/pod-a');
  });
  const finishDelete = () =>
    act(async () => {
      resolveDelete();
      await pending;
    });

  return { result, finishDelete };
}

describe('useDeleteResource', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
    mockDelete.mockReset();
    mockNavigate.mockReset();
  });

  it('goes back to the list after deleting the open resource', async () => {
    const { result, finishDelete } = startDelete();

    await finishDelete();

    expect(mockNavigate).toHaveBeenCalledWith(
      '/deployments/deploy-a?layout=TwoColumnsMidExpanded',
    );
    expect(result.current.layout).toMatchObject({
      layout: 'TwoColumnsMidExpanded',
      midColumn: initialLayout.midColumn,
      endColumn: null,
    });
  });

  it('keeps layout changes made while the delete request is running', async () => {
    const { result, finishDelete } = startDelete();
    const otherDeployment = {
      resourceType: 'Deployment',
      resourceName: 'deploy-b',
    };

    act(() =>
      result.current.setLayout((prev) => ({
        ...prev,
        midColumn: otherDeployment,
      })),
    );
    await finishDelete();

    expect(result.current.layout).toMatchObject({
      layout: 'TwoColumnsMidExpanded',
      midColumn: otherDeployment,
      endColumn: null,
    });
  });

  it('stays on the page users navigated to while the delete request is running', async () => {
    const { result, finishDelete } = startDelete();
    const overviewLayout = {
      ...initialLayout,
      layout: 'OneColumn',
      midColumn: null,
      endColumn: null,
    };

    act(() => {
      window.history.pushState({}, '', '/overview');
      result.current.setLayout(overviewLayout);
    });
    await finishDelete();

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(result.current.layout).toEqual(overviewLayout);
  });
});
