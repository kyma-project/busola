import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

const { ModuleTemplatesCtx, CommunityModuleCtx } = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createContext } = require('react') as typeof import('react');
  return {
    ModuleTemplatesCtx: createContext<any>({}),
    CommunityModuleCtx: createContext<any>({}),
  };
});

const notifySuccessMock = vi.fn();
vi.mock('shared/contexts/NotificationContext', () => ({
  useNotification: () => ({
    notifySuccess: notifySuccessMock,
    notifyError: vi.fn(),
  }),
}));

vi.mock('jotai', async () => {
  const actual: any = await vi.importActual('jotai');
  return { ...actual, useAtomValue: () => [] };
});

const uploadResourcesMock = vi.fn();
vi.mock('resources/Namespaces/YamlUpload/useUploadResources', () => ({
  useUploadResources: () => uploadResourcesMock,
}));

const fetchResourcesToApplyMock = vi.fn().mockResolvedValue(undefined);
const getUpdateTemplateMock = vi.fn();
vi.mock('../../community/communityModulesHelpers', () => ({
  fetchResourcesToApply: (...args: any[]) => fetchResourcesToApplyMock(...args),
  getUpdateTemplate: (...args: any[]) => getUpdateTemplateMock(...args),
}));

vi.mock('./DeleteOldModulesCheck', async () => {
  const { useState } = await import('react');
  return {
    useDeleteOldModuleTemplates: (_tpls: any[]) => {
      const [del, setDel] = useState(true);
      return {
        deleteOldTemplate: del,
        setDeleteOldTemplate: setDel,
        deleteOldTemplates: vi.fn().mockResolvedValue(undefined),
      };
    },
    DeleteOldModulesCheck: ({ oldModuleTemplates }: any) =>
      oldModuleTemplates.length > 0 ? (
        <div data-testid="delete-old-check" />
      ) : null,
  };
});

vi.mock('components/Modules/providers/ModuleTemplatesProvider', () => ({
  ModuleTemplatesContext: ModuleTemplatesCtx,
}));

vi.mock(
  'components/Modules/community/providers/CommunityModuleProvider',
  () => ({
    CommunityModuleContext: CommunityModuleCtx,
  }),
);

// Must come after vi.mock calls
import { UpdateAllModulesButton } from './UpdateAllModulesButton';

const makeTpl = (name: string, version: string) => ({
  apiVersion: 'operator.kyma-project.io/v1beta2',
  kind: 'ModuleTemplate',
  metadata: {
    name: `${name}-${version}`,
    namespace: 'kyma-system',
    labels: { 'operator.kyma-project.io/module-name': name },
    annotations: {},
    creationTimestamp: '2024-01-01T00:00:00Z',
  },
  spec: { version },
});

const installedModuleA = {
  name: 'mod-a',
  version: '1.0.0',
  namespace: 'kyma-system',
};
const installedModuleB = {
  name: 'mod-b',
  version: '1.0.0',
  namespace: 'kyma-system',
};
const repoTplA = makeTpl('mod-a', '2.0.0');
const repoTplB = makeTpl('mod-b', '2.0.0');

const renderWithContexts = (
  installedModules: any[],
  installedTpls: any[],
  preloadedTpls: any[],
) => {
  return render(
    <ModuleTemplatesCtx.Provider
      value={{
        preloadedCommunityTemplates: { items: preloadedTpls },
        moduleTemplatesLoading: false,
        moduleReleaseMetas: { items: [] },
        moduleReleaseMetasLoading: false,
        communityModuleTemplates: { items: [] },
        moduleTemplates: { items: [] },
      }}
    >
      <CommunityModuleCtx.Provider
        value={{
          installedCommunityModules: installedModules,
          installedCommunityModuleTemplates: { items: installedTpls },
          notInstalledCommunityModuleTemplates: { items: [] },
          installedCommunityModulesLoading: false,
          installedVersions: new Map(),
        }}
      >
        <UpdateAllModulesButton />
      </CommunityModuleCtx.Provider>
    </ModuleTemplatesCtx.Provider>,
  );
};

describe('UpdateAllModulesButton', () => {
  beforeEach(() => {
    notifySuccessMock.mockReset();
    uploadResourcesMock.mockReset();
    fetchResourcesToApplyMock.mockReset().mockResolvedValue(undefined);
    getUpdateTemplateMock.mockReset();
  });

  it('renders nothing when there are no updatable modules', () => {
    getUpdateTemplateMock.mockReturnValue(null);
    const { container } = renderWithContexts([installedModuleA], [], []);
    expect(container.firstChild).toBeNull();
  });

  it('renders the "Update all" button when updates are available', () => {
    getUpdateTemplateMock.mockReturnValue(repoTplA);
    renderWithContexts([installedModuleA], [], [repoTplA]);
    expect(
      screen.getByText('modules.community.update.update-all'),
    ).toBeInTheDocument();
  });

  it('does not show the dialog initially', () => {
    getUpdateTemplateMock.mockReturnValue(repoTplA);
    renderWithContexts([installedModuleA], [], [repoTplA]);
    expect(
      screen.queryByText('modules.community.update.update-all-title'),
    ).toBeNull();
  });

  it('opens the dialog when the button is clicked', () => {
    getUpdateTemplateMock.mockReturnValue(repoTplA);
    renderWithContexts([installedModuleA], [], [repoTplA]);
    fireEvent.click(screen.getByText('modules.community.update.update-all'));
    expect(
      screen.getByText('modules.community.update.update-all-title'),
    ).toBeInTheDocument();
  });

  it('renders "Update all" button for multiple updatable modules', () => {
    // Verify the button appears when there are 2 updatable modules
    getUpdateTemplateMock.mockReturnValue(repoTplA);
    renderWithContexts(
      [installedModuleA, installedModuleB],
      [],
      [repoTplA, repoTplB],
    );
    expect(
      screen.getByText('modules.community.update.update-all'),
    ).toBeInTheDocument();
  });

  it('shows current and new versions in the table', () => {
    getUpdateTemplateMock.mockReturnValue(repoTplA);
    renderWithContexts([installedModuleA], [], [repoTplA]);
    fireEvent.click(screen.getByText('modules.community.update.update-all'));
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
    expect(screen.getByText('2.0.0')).toBeInTheDocument();
  });

  it('closes the dialog when Cancel is clicked', () => {
    getUpdateTemplateMock.mockReturnValue(repoTplA);
    renderWithContexts([installedModuleA], [], [repoTplA]);
    fireEvent.click(screen.getByText('modules.community.update.update-all'));
    fireEvent.click(screen.getByText('common.buttons.cancel'));
    expect(
      screen.queryByText('modules.community.update.update-all-title'),
    ).toBeNull();
  });

  it('does not render DeleteOldModulesCheck when there are no old templates', () => {
    getUpdateTemplateMock.mockReturnValue(repoTplA);
    renderWithContexts([installedModuleA], [], [repoTplA]);
    fireEvent.click(screen.getByText('modules.community.update.update-all'));
    expect(screen.queryByTestId('delete-old-check')).toBeNull();
  });

  it('renders DeleteOldModulesCheck when old templates exist', () => {
    getUpdateTemplateMock.mockReturnValue(repoTplA);
    const oldTpl = makeTpl('mod-a', '0.9.0');
    renderWithContexts([installedModuleA], [oldTpl], [repoTplA]);
    fireEvent.click(screen.getByText('modules.community.update.update-all'));
    expect(screen.getByTestId('delete-old-check')).toBeInTheDocument();
  });

  it('sends update-started notification and closes dialog on confirm', () => {
    getUpdateTemplateMock.mockReturnValue(repoTplA);
    renderWithContexts([installedModuleA], [], [repoTplA]);
    fireEvent.click(screen.getByText('modules.community.update.update-all'));

    fireEvent.click(screen.getByText('kyma-modules.update'));

    expect(notifySuccessMock).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'modules.community.messages.module-update-started',
      }),
    );
    expect(
      screen.queryByText('modules.community.update.update-all-title'),
    ).toBeNull();
  });
});
