import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';

// Capture props the GenericList is rendered with so we can assert behavior
// without standing up the entire UI5 + router + jotai stack.
const genericListProps: { current: any } = { current: null };

vi.mock('shared/components/GenericList/GenericList', () => ({
  GenericList: (props: any) => {
    genericListProps.current = props;
    return null;
  },
}));

const navigateMock = vi.fn();
vi.mock('react-router', async () => {
  const actual: any = await vi.importActual('react-router');
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock('hooks/useUrl', () => ({
  useUrl: () => ({
    clusterUrl: (p: string) => `/cluster/${p}`,
    namespaceUrl: (p: string) => `/ns/${p}`,
  }),
}));

vi.mock('shared/hooks/BackendAPI/useGet', () => ({
  useGet: () => ({ data: { items: [] }, silentRefetch: vi.fn() }),
  useGetList: () => () => ({ data: [], silentRefetch: vi.fn() }),
  useGetScope: () => async () => false,
}));

const fetchMock = vi.fn().mockResolvedValue({
  json: async () => ({
    items: [
      {
        metadata: { name: 'foo-instance', namespace: 'foo-ns' },
      },
    ],
  }),
});
vi.mock('shared/hooks/BackendAPI/useFetch', () => ({
  useFetch: () => fetchMock,
}));

vi.mock('components/Modules/components/ModulesListRows', () => ({
  ModulesListRows: () => ['name-cell'],
}));

vi.mock('components/Modules/support', async () => {
  const actual: any = await vi.importActual('components/Modules/support');
  return {
    ...actual,
    findModuleTemplate: () => ({
      metadata: { name: 'tpl', namespace: 'foo-ns' },
      spec: {
        manager: { namespace: 'foo-ns' },
        data: {
          kind: 'Foo',
          apiVersion: 'foo.example.com/v1',
          metadata: { name: 'foo-instance', namespace: 'foo-ns' },
        },
      },
    }),
    findExtension: () => null,
    findCrd: (kind: string) =>
      kind === 'Foo' ? { metadata: { name: 'foos.foo.example.com' } } : null,
    createModulePartialPath: () => 'foos/foo-instance',
  };
});

vi.mock('jotai', async () => {
  const actual: any = await vi.importActual('jotai');
  return { ...actual, useSetAtom: () => vi.fn() };
});

vi.mock(
  'components/Modules/community/providers/CommunitModulesInstalationProvider',
  () => ({
    CommunityModulesInstallationContext: {
      Provider: ({ children }: any) => children,
      Consumer: ({ children }: any) => children({}),
      displayName: 'mock',
      $$typeof: Symbol.for('react.context'),
      _currentValue: { modulesDuringUpload: [] },
      _currentValue2: { modulesDuringUpload: [] },
    },
    moduleInstallationState: {},
  }),
);

import { CommunityModulesList } from './CommunityModulesList';

const installedModule = {
  name: 'foo',
  channel: 'regular',
  version: '1.0.0',
  namespace: 'foo-ns',
  resource: {
    kind: 'Foo',
    apiVersion: 'foo.example.com/v1',
    metadata: { name: 'foo-manager', namespace: 'foo-ns' },
  },
};

const renderList = (setOpenedModuleIndex = vi.fn()) => {
  render(
    <CommunityModulesList
      moduleTemplates={{ items: [] } as any}
      selectedModules={[installedModule] as any}
      modulesLoading={false}
      namespaced={false}
      resourceUrl=""
      setOpenedModuleIndex={setOpenedModuleIndex}
      handleResourceDelete={vi.fn()}
    />,
  );
  return { setOpenedModuleIndex };
};

describe('CommunityModulesList', () => {
  beforeEach(() => {
    genericListProps.current = null;
    navigateMock.mockReset();
    fetchMock.mockClear();
  });

  it('does not pass namespaceColIndex to GenericList (regression #4798)', () => {
    renderList();
    expect(genericListProps.current).not.toBeNull();
    // Must be unset so handleRowClick matches entries by name only
    expect(genericListProps.current.namespaceColIndex).toBeUndefined();
  });

  it('opens the module details when a row is clicked', async () => {
    const { setOpenedModuleIndex } = renderList();
    const customRowClick = genericListProps.current.customRowClick;
    expect(typeof customRowClick).toBe('function');

    await customRowClick('foo', installedModule);

    expect(setOpenedModuleIndex).toHaveBeenCalledWith(0);
    expect(navigateMock).toHaveBeenCalled();
  });

  it('uses shared hooks for navigation and CRD/extension fetching', () => {
    renderList();
    // Verify GenericList receives the expected props from the shared hooks
    expect(genericListProps.current.customRowClick).toBeDefined();
    expect(genericListProps.current.customColumnLayout).toBeDefined();
    expect(genericListProps.current.hasDetailsView).toBe(true);
    expect(genericListProps.current.enableColumnLayout).toBe(true);
    expect(genericListProps.current.displayArrow).toBe(true);
  });

  it('does not crash or update state when moduleStatus is undefined', async () => {
    const { setOpenedModuleIndex } = renderList();
    const customRowClick = genericListProps.current.customRowClick;

    // Simulate entries.find() returning undefined (e.g., DOM text mismatch)
    await customRowClick('nonexistent', undefined);

    expect(setOpenedModuleIndex).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('does not navigate or update state when hasDetailsLink is false', async () => {
    const { setOpenedModuleIndex } = renderList();
    const customRowClick = genericListProps.current.customRowClick;

    // Entry with a kind that has no matching extension or CRD
    const moduleWithNoDetails = {
      name: 'bar',
      resource: {
        kind: 'UnknownKind',
        apiVersion: 'v1',
        metadata: { name: 'bar-instance', namespace: '' },
      },
    };

    await customRowClick('bar', moduleWithNoDetails);

    expect(setOpenedModuleIndex).not.toHaveBeenCalled();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
