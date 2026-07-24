import { describe, it, expect, beforeEach, vi } from 'vitest';
import { clusterResourceHandler } from '../clusterResourceHandler';
import { crHandler } from '../crHandler';
import { CommandPaletteContext } from '../../types';

const baseContext = (
  overrides: Partial<CommandPaletteContext>,
): CommandPaletteContext =>
  ({
    activeClusterName: 'my-cluster',
    tokens: [],
    clusterNodes: [],
    namespaceNodes: [],
    namespace: null,
    showHiddenNamespaces: true,
    hiddenNamespaces: [],
    resourceCache: {},
    t: ((key: string) => key) as any,
    navigate: vi.fn(),
    ...overrides,
  }) as CommandPaletteContext;

const activate = (result: any, navigate: ReturnType<typeof vi.fn>) => {
  result.onActivate();
  return navigate.mock.calls.at(-1)?.[0] as string;
};

describe('command palette navigation layout', () => {
  beforeEach(() => window.history.pushState({}, '', '/'));

  it('opens a namespace single-column (no layout param)', () => {
    const navigate = vi.fn();
    const results = clusterResourceHandler.createResults(
      baseContext({
        navigate,
        tokens: ['namespaces', '/', 'my-ns'],
        clusterNodes: [
          { resourceType: 'namespaces', pathSegment: 'namespaces' } as any,
        ],
        resourceCache: { namespaces: [{ metadata: { name: 'my-ns' } } as any] },
      }),
    )!;

    expect(activate(results[0], navigate)).toBe(
      '/cluster/my-cluster/namespaces/my-ns',
    );
  });

  it('opens a custom-resource type list beside its group (no empty third column)', () => {
    const navigate = vi.fn();
    const clusterCrd = {
      metadata: { name: 'moduletemplates.operator.kyma-project.io' },
      spec: {
        group: 'operator.kyma-project.io',
        scope: 'Cluster',
        names: { kind: 'ModuleTemplate', plural: 'moduletemplates' },
        versions: [{ name: 'v1beta2', served: true }],
      },
    } as any;
    const results = crHandler.createResults(
      baseContext({
        navigate,
        tokens: ['moduletemplates'],
        resourceCache: { customresourcedefinitions: [clusterCrd] },
      }),
    )!;

    expect(activate(results[0], navigate)).toBe(
      '/cluster/my-cluster/customresources/moduletemplates.operator.kyma-project.io?layout=TwoColumnsMidExpanded',
    );
  });
});
