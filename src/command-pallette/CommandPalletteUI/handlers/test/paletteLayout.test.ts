import { describe, it, expect, beforeEach, vi } from 'vitest';
import { clusterResourceHandler } from '../clusterResourceHandler';
import { namespacedResourceHandler } from '../namespacedResourceHandler';
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

const navigatedPath = (result: any, navigate: ReturnType<typeof vi.fn>) => {
  result.onActivate();
  return navigate.mock.calls.at(-1)?.[0] as string;
};

const crd = (scope: 'Cluster' | 'Namespaced') =>
  ({
    metadata: { name: `myresources.example.com` },
    spec: {
      group: 'example.com',
      scope,
      names: { kind: 'MyResource', plural: 'myresources' },
      versions: [{ name: 'v1', served: true }],
    },
  }) as any;

describe('command palette navigation layout', () => {
  beforeEach(() => window.history.pushState({}, '', '/'));

  describe('namespaces (single-column by design)', () => {
    it('opens namespace details with no layout param', () => {
      const navigate = vi.fn();
      const results = clusterResourceHandler.createResults(
        baseContext({
          navigate,
          tokens: ['namespaces', '/', 'my-ns'],
          clusterNodes: [
            { resourceType: 'namespaces', pathSegment: 'namespaces' } as any,
          ],
          resourceCache: {
            namespaces: [{ metadata: { name: 'my-ns' } } as any],
          },
        }),
      )!;

      expect(navigatedPath(results[0], navigate)).toBe(
        '/cluster/my-cluster/namespaces/my-ns',
      );
    });
  });

  describe('cluster-scoped resources', () => {
    it('opens a list single-column (no layout param)', () => {
      const navigate = vi.fn();
      const results = clusterResourceHandler.createResults(
        baseContext({
          navigate,
          tokens: ['clusterroles'],
          clusterNodes: [
            {
              resourceType: 'clusterroles',
              pathSegment: 'clusterroles',
            } as any,
          ],
        }),
      )!;

      expect(navigatedPath(results[0], navigate)).toBe(
        '/cluster/my-cluster/clusterroles',
      );
    });

    it('opens details in two columns', () => {
      const navigate = vi.fn();
      const results = clusterResourceHandler.createResults(
        baseContext({
          navigate,
          tokens: ['clusterroles', '/', 'admin'],
          clusterNodes: [
            {
              resourceType: 'clusterroles',
              pathSegment: 'clusterroles',
            } as any,
          ],
          resourceCache: {
            clusterroles: [{ metadata: { name: 'admin' } } as any],
          },
        }),
      )!;

      expect(navigatedPath(results[0], navigate)).toBe(
        '/cluster/my-cluster/clusterroles/admin?layout=TwoColumnsMidExpanded',
      );
    });
  });

  describe('namespaced resources', () => {
    it('opens a list single-column (no layout param)', () => {
      const navigate = vi.fn();
      const results = namespacedResourceHandler.createResults(
        baseContext({
          navigate,
          namespace: 'my-ns',
          tokens: ['pods'],
          namespaceNodes: [
            { resourceType: 'pods', pathSegment: 'pods' } as any,
          ],
        }),
      )!;

      expect(navigatedPath(results[0], navigate)).toBe(
        '/cluster/my-cluster/namespaces/my-ns/pods',
      );
    });

    it('opens details in two columns', () => {
      const navigate = vi.fn();
      const results = namespacedResourceHandler.createResults(
        baseContext({
          navigate,
          namespace: 'my-ns',
          tokens: ['pods', '/', 'my-pod'],
          namespaceNodes: [
            { resourceType: 'pods', pathSegment: 'pods' } as any,
          ],
          resourceCache: {
            'my-ns/pods': [
              { metadata: { name: 'my-pod', namespace: 'my-ns' } } as any,
            ],
          },
        }),
      )!;

      expect(navigatedPath(results[0], navigate)).toBe(
        '/cluster/my-cluster/namespaces/my-ns/pods/my-pod?layout=TwoColumnsMidExpanded',
      );
    });
  });

  describe('custom resources (generic route)', () => {
    it('opens a type list beside its group, no empty third column', () => {
      const navigate = vi.fn();
      const results = crHandler.createResults(
        baseContext({
          navigate,
          tokens: ['myresources'],
          resourceCache: { customresourcedefinitions: [crd('Cluster')] },
        }),
      )!;

      expect(navigatedPath(results[0], navigate)).toBe(
        '/cluster/my-cluster/customresources/myresources.example.com?layout=TwoColumnsMidExpanded',
      );
    });

    it('opens an instance in three columns (group | type | details)', () => {
      const navigate = vi.fn();
      const results = crHandler.createResults(
        baseContext({
          navigate,
          tokens: ['myresources', '/', 'my-cr'],
          resourceCache: {
            customresourcedefinitions: [crd('Cluster')],
            myresources: [{ metadata: { name: 'my-cr' } } as any],
          },
        }),
      )!;

      expect(navigatedPath(results[0], navigate)).toBe(
        '/cluster/my-cluster/customresources/myresources.example.com/my-cr?layout=ThreeColumnsEndExpanded',
      );
    });
  });

  describe('extensibility / custom nav-node resources', () => {
    it('opens a list single-column (its route has no group column)', () => {
      const navigate = vi.fn();
      const results = crHandler.createResults(
        baseContext({
          navigate,
          tokens: ['myresources'],
          clusterNodes: [
            { resourceType: 'myresources', pathSegment: 'myresources' } as any,
          ],
          resourceCache: { customresourcedefinitions: [crd('Cluster')] },
        }),
      )!;

      expect(navigatedPath(results[0], navigate)).toBe(
        '/cluster/my-cluster/myresources',
      );
    });

    it('opens a namespaced instance in two columns', () => {
      const navigate = vi.fn();
      const results = crHandler.createResults(
        baseContext({
          navigate,
          namespace: 'my-ns',
          tokens: ['myresources', '/', 'my-cr'],
          namespaceNodes: [
            { resourceType: 'myresources', pathSegment: 'myresources' } as any,
          ],
          resourceCache: {
            customresourcedefinitions: [crd('Namespaced')],
            'my-ns/myresources': [{ metadata: { name: 'my-cr' } } as any],
          },
        }),
      )!;

      expect(navigatedPath(results[0], navigate)).toBe(
        '/cluster/my-cluster/namespaces/my-ns/myresources/my-cr?layout=TwoColumnsMidExpanded',
      );
    });
  });
});
