import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { ColumnLayoutState } from 'state/columnLayoutAtom';
import { ModulesDeleteBox } from './ModulesDeleteBox';

const mockDeleteResources = vi.fn();
vi.mock('../deleteModulesHelpers', () => ({
  checkIfAllResourcesAreDeleted: vi.fn(),
  checkIfAssociatedResourceLeft: () => false,
  deleteResources: (...args: unknown[]) => mockDeleteResources(...args),
  fetchResourceCounts: async () => ({}),
  generateAssociatedResourcesUrls: async () => [],
  getAssociatedResources: () => [],
  getCommunityResources: async () => [],
  getCommunityResourceUrls: async () => ['/apis/example.com/v1/apples/a'],
  getCRResource: () => [],
  handleItemClick: vi.fn(),
}));

const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useNavigate: () => mockNavigate,
}));

vi.mock('state/navigation/allNodesAtom', async () => {
  const { atom } = await import('jotai');
  return { allNodesAtomSync: atom([]) };
});

vi.mock('shared/hooks/BackendAPI/useGet', () => ({
  useGetScope: () => vi.fn(),
  useSingleGet: () => vi.fn(),
}));
vi.mock('shared/hooks/BackendAPI/useMutation', () => ({
  useDelete: () => vi.fn(),
}));
vi.mock('shared/hooks/BackendAPI/usePost', () => ({
  usePost: () => vi.fn(),
}));

vi.mock('shared/contexts/NotificationContext', () => ({
  useNotification: () => ({ notifySuccess: vi.fn(), notifyError: vi.fn() }),
}));

vi.mock('hooks/useUrl', () => ({
  useUrl: () => ({
    clusterUrl: (path: string) => `/cluster/c/${path}`,
    namespaceUrl: (path: string) => `/cluster/c/namespaces/ns/${path}`,
  }),
}));

const flush = () => act(() => new Promise((r) => setTimeout(r, 0)));

const currentLayout: ColumnLayoutState = {
  layout: 'TwoColumnsMidExpanded',
  startColumn: { resourceType: 'kymas', resourceName: null },
  midColumn: { resourceType: 'apples', resourceName: 'apple' },
  endColumn: null,
  showCreate: null,
  showEdit: null,
};

// Starts uninstalling the community module "apple" from its details;
// the delete requests stay pending until finishDelete().
async function startDelete() {
  window.history.replaceState(
    {},
    '',
    '/cluster/c/kymamodules/apple?layout=TwoColumnsMidExpanded',
  );
  let resolveDelete: () => void = () => {};
  mockDeleteResources.mockReturnValue(
    new Promise<void>((r) => (resolveDelete = r)),
  );
  const DeleteMessageBox = vi.fn((_props: any) => null);
  const setLayoutColumn = vi.fn();

  render(
    <ModulesDeleteBox
      DeleteMessageBox={DeleteMessageBox}
      moduleTemplates={{ items: [] }}
      selectedModules={[{ name: 'apple' }]}
      chosenModuleIndex={0}
      kymaResource={null}
      detailsOpen
      isCommunity
      namespaced={false}
      showDeleteDialog
      performDelete={vi.fn()}
      performCancel={vi.fn()}
      setLayoutColumn={setLayoutColumn}
      setChosenModuleIndex={vi.fn()}
    />,
  );
  // let the community resource URLs load before confirming
  await flush();
  act(() => DeleteMessageBox.mock.lastCall?.[0].deleteFn());

  const finishDelete = async () => {
    resolveDelete();
    await flush();
  };

  return { setLayoutColumn, finishDelete };
}

describe('ModulesDeleteBox', () => {
  afterEach(() => {
    window.history.replaceState({}, '', '/');
    mockDeleteResources.mockReset();
    mockNavigate.mockReset();
  });

  it('goes back to the modules list after uninstalling the open module', async () => {
    const { setLayoutColumn, finishDelete } = await startDelete();

    await finishDelete();

    expect(mockNavigate).toHaveBeenCalledWith('/cluster/c/kymamodules');
    const update = setLayoutColumn.mock.lastCall?.[0];
    expect(update(currentLayout)).toEqual({
      ...currentLayout,
      layout: 'OneColumn',
      startColumn: null,
      midColumn: null,
      endColumn: null,
    });
  });

  it('stays on the page users navigated to while the delete requests are running', async () => {
    const { setLayoutColumn, finishDelete } = await startDelete();

    window.history.pushState({}, '', '/cluster/c/overview');
    await finishDelete();

    expect(mockNavigate).not.toHaveBeenCalled();
    expect(setLayoutColumn).not.toHaveBeenCalled();
  });
});
