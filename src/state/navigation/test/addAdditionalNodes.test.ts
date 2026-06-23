import { describe, it, expect, vi } from 'vitest';
import { NavNode } from '../../types';

// Stub NavNode constants returned by the mocked component modules.
// Their shapes must match what mapBusolaResourceToNavNode produces from the
// real resource metadata, because addAdditionalNodes uses isEqual() to locate
// these sentinel nodes in the input list.
const stubExtensionsNavNode: NavNode = {
  category: 'Configuration',
  resourceType: 'configmaps',
  resourceTypeCased: 'ConfigMap',
  pathSegment: 'busolaextensions',
  label: 'Extensions',
  namespaced: false,
  requiredFeatures: ['EXTENSIBILITY' as const],
  apiGroup: '',
  apiVersion: 'v1',
};

const stubHelmReleasesNode: NavNode = {
  category: 'Apps',
  resourceType: 'helmreleases',
  resourceTypeCased: 'HelmReleases',
  pathSegment: 'helm-releases',
  label: 'Helm Releases',
  namespaced: true,
  requiredFeatures: [],
  apiGroup: '',
  apiVersion: 'v1',
};

const stubKymaModulesNavNode: NavNode = {
  category: 'Configuration',
  resourceType: 'kyma',
  resourceTypeCased: 'Kyma',
  pathSegment: 'kymamodules',
  label: 'Modules',
  namespaced: false,
  requiredFeatures: [],
  apiGroup: '',
  apiVersion: 'v1',
};

const stubNamespaceOverviewNode: NavNode = {
  category: '',
  icon: 'bbyd-dashboard',
  resourceType: 'namespaces',
  resourceTypeCased: 'Namespaces',
  pathSegment: '',
  label: 'Namespace Overview',
  namespaced: true,
  requiredFeatures: [],
  apiGroup: '',
  apiVersion: '',
  topLevelNode: true,
};

const stubCustomResourcesNavNode = (namespaced: boolean): NavNode => ({
  category: 'Configuration',
  resourceType: 'customresources',
  resourceTypeCased: 'CustomResources',
  pathSegment: 'customresources',
  label: 'Custom Resources',
  namespaced,
  requiredFeatures: [],
  apiGroup: 'apiextensions.k8s.io',
  apiVersion: 'v1',
});

vi.mock('components/BusolaExtensions/extensionsNode', () => ({
  extensionsNavNode: stubExtensionsNavNode,
}));
vi.mock('components/HelmReleases/helmReleasesNode', () => ({
  helmReleasesNode: stubHelmReleasesNode,
}));
vi.mock('components/CustomResources/customResourcesNode', () => ({
  createCustomResourcesNavNode: (scope: 'cluster' | 'namespace') =>
    stubCustomResourcesNavNode(scope === 'namespace'),
}));
vi.mock('resources/Namespaces/namespaceOverviewNode', () => ({
  namespaceOverviewNode: stubNamespaceOverviewNode,
}));
vi.mock('components/Modules/kymaModulesNode', () => ({
  kymaModulesNavNode: stubKymaModulesNavNode,
}));

// These resource modules export React components alongside their NavNode
// metadata. Use importOriginal to get the real metadata fields while replacing
// the lazy component exports with stubs so JSX/React doesn't get evaluated.
// We must also explicitly pass through any field that mapBusolaResourceToNavNode
// accesses (including optional ones like pathSegment) to avoid Vitest's strict
// mock property access errors.
// Null-declare all optional fields that mapBusolaResourceToNavNode reads
// (pathSegment, label, icon, topLevelNode, aliases, requiredFeatures) before
// spreading the actual module, so Vitest's strict mock doesn't throw on access.
// vi.mock is hoisted so we can't use a shared variable — inline all fields.
vi.mock('resources/Secrets', () => ({
  resourceType: 'Secrets',
  namespaced: true,
  apiGroup: '',
  apiVersion: 'v1',
  category: 'Configuration',
  pathSegment: undefined,
  label: undefined,
  icon: undefined,
  topLevelNode: undefined,
  aliases: undefined,
  requiredFeatures: undefined,
}));
vi.mock('resources/CustomResourceDefinitions', () => ({
  resourceType: 'CustomResourceDefinitions',
  namespaced: false,
  apiGroup: 'apiextensions.k8s.io',
  apiVersion: 'v1',
  category: 'Configuration',
  aliases: ['crds'],
  pathSegment: undefined,
  label: undefined,
  icon: undefined,
  topLevelNode: undefined,
  requiredFeatures: undefined,
}));
vi.mock('resources/ConfigMaps', () => ({
  resourceType: 'ConfigMaps',
  namespaced: true,
  apiGroup: '',
  apiVersion: 'v1',
  category: 'Configuration',
  pathSegment: undefined,
  label: undefined,
  icon: undefined,
  topLevelNode: undefined,
  aliases: undefined,
  requiredFeatures: undefined,
}));

// Import under test after mocks are registered.
const { addAdditionalNodes } = await import('../addAdditionalNodes');

// Compute the sentinel nodes exactly as the module does, so we can include
// them in input arrays and trigger the isEqual() matches.
const { mapBusolaResourceToNavNode } =
  await import('../../resourceList/mapBusolaResourceToNavNode');
import * as secretMeta from 'resources/Secrets';
import * as crdMeta from 'resources/CustomResourceDefinitions';
import * as cmMeta from 'resources/ConfigMaps';

const sentinelCm = mapBusolaResourceToNavNode(cmMeta as any);
const sentinelCrd = mapBusolaResourceToNavNode(crdMeta as any);
const sentinelSecret = mapBusolaResourceToNavNode(secretMeta as any);

const noFeatures = {};
const extEnabledFeatures = { EXTENSIBILITY: { isEnabled: true } } as any;

describe('addAdditionalNodes', () => {
  it('returns input unchanged when scope is cluster and no sentinel nodes are present', () => {
    const node: NavNode = {
      resourceType: 'pods',
      resourceTypeCased: 'Pods',
      category: 'Workloads',
      namespaced: false,
      label: 'Pods',
      pathSegment: 'pods',
      requiredFeatures: [],
      apiVersion: 'v1',
      apiGroup: '',
    };
    const result = addAdditionalNodes([node], 'cluster', noFeatures, false);
    expect(result).toEqual([node]);
  });

  it('prepends namespaceOverviewNode when scope is namespace', () => {
    const result = addAdditionalNodes([], 'namespace', noFeatures, false);
    expect(result).toContainEqual(stubNamespaceOverviewNode);
    expect(result[0]).toEqual(stubNamespaceOverviewNode);
  });

  it('does NOT prepend namespaceOverviewNode for cluster scope', () => {
    const result = addAdditionalNodes([], 'cluster', noFeatures, false);
    expect(result).not.toContainEqual(stubNamespaceOverviewNode);
  });

  it('inserts extensionsNavNode (cluster scope) when extensibility enabled and CM present', () => {
    const result = addAdditionalNodes(
      [sentinelCm],
      'cluster',
      extEnabledFeatures,
      false,
    );
    expect(result).toContainEqual(stubExtensionsNavNode);
  });

  it('does NOT insert extensionsNavNode for namespace scope', () => {
    const result = addAdditionalNodes(
      [sentinelCm],
      'namespace',
      extEnabledFeatures,
      false,
    );
    expect(result).not.toContainEqual(stubExtensionsNavNode);
  });

  it('does NOT insert extensionsNavNode when CM is not in node list', () => {
    const result = addAdditionalNodes([], 'cluster', extEnabledFeatures, false);
    expect(result).not.toContainEqual(stubExtensionsNavNode);
  });

  it('does NOT insert extensionsNavNode when extensibility feature is disabled', () => {
    const features = { EXTENSIBILITY: { isEnabled: false } } as any;
    const result = addAdditionalNodes([sentinelCm], 'cluster', features, false);
    expect(result).not.toContainEqual(stubExtensionsNavNode);
  });

  it('inserts kymaModulesNavNode (non-namespaced) for cluster scope when COMMUNITY_MODULES enabled', () => {
    const features = {
      EXTENSIBILITY: { isEnabled: true },
      COMMUNITY_MODULES: { isEnabled: true },
    } as any;
    const result = addAdditionalNodes([sentinelCm], 'cluster', features, false);
    expect(result).toContainEqual(stubKymaModulesNavNode);
  });

  it('inserts kymaModulesNavNode (namespaced) for namespace scope when COMMUNITY_MODULES enabled', () => {
    const features = {
      EXTENSIBILITY: { isEnabled: true },
      COMMUNITY_MODULES: { isEnabled: true },
    } as any;
    const result = addAdditionalNodes(
      [sentinelCm],
      'namespace',
      features,
      false,
    );
    expect(result).toContainEqual({
      ...stubKymaModulesNavNode,
      namespaced: true,
    });
  });

  it('inserts kymaModulesNavNode when isKymaResources is true', () => {
    const result = addAdditionalNodes(
      [sentinelCm],
      'cluster',
      extEnabledFeatures,
      true,
    );
    expect(result).toContainEqual(stubKymaModulesNavNode);
  });

  it('does NOT insert kymaModulesNavNode when COMMUNITY_MODULES disabled and isKymaResources false', () => {
    const result = addAdditionalNodes(
      [sentinelCm],
      'cluster',
      extEnabledFeatures,
      false,
    );
    expect(result).not.toContainEqual(stubKymaModulesNavNode);
  });

  it('inserts customResourcesNavNode after the CRD node', () => {
    const result = addAdditionalNodes(
      [sentinelCrd],
      'cluster',
      noFeatures,
      false,
    );
    const crdIdx = result.findIndex(
      (n) =>
        n.resourceType === sentinelCrd.resourceType &&
        n.apiGroup === sentinelCrd.apiGroup,
    );
    const crIdx = result.findIndex((n) => n.resourceType === 'customresources');
    expect(crIdx).toBe(crdIdx + 1);
  });

  it('inserts helmReleasesNode after the Secret node', () => {
    const result = addAdditionalNodes(
      [sentinelSecret],
      'cluster',
      noFeatures,
      false,
    );
    const secretIdx = result.findIndex(
      (n) => n.resourceType === sentinelSecret.resourceType,
    );
    const helmIdx = result.findIndex((n) => n.resourceType === 'helmreleases');
    expect(helmIdx).toBe(secretIdx + 1);
  });

  it('does NOT insert helmReleasesNode when Secret is not in the list', () => {
    const result = addAdditionalNodes([], 'cluster', noFeatures, false);
    expect(result).not.toContainEqual(stubHelmReleasesNode);
  });

  it('does NOT insert customResourcesNavNode when CRD is not in the list', () => {
    const result = addAdditionalNodes([], 'cluster', noFeatures, false);
    expect(result.some((n) => n.resourceType === 'customresources')).toBe(
      false,
    );
  });

  it('handles all inserts together correctly', () => {
    const features = {
      EXTENSIBILITY: { isEnabled: true },
      COMMUNITY_MODULES: { isEnabled: true },
    } as any;
    const input = [sentinelCm, sentinelCrd, sentinelSecret];
    const result = addAdditionalNodes(input, 'cluster', features, false);
    const types = result.map((n) => n.resourceType);
    expect(types).toContain('configmaps'); // CM sentinel
    expect(types).toContain('customresourcedefinitions');
    expect(types).toContain('secrets');
    expect(result).toContainEqual(stubExtensionsNavNode);
    expect(result).toContainEqual(stubKymaModulesNavNode);
    expect(result.some((n) => n.resourceType === 'customresources')).toBe(true);
    expect(result).toContainEqual(stubHelmReleasesNode);
  });
});
