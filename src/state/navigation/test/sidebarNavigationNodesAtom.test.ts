import { describe, it, expect } from 'vitest';
import { mergeInExtensibilityNav } from '../sidebarNavigationNodesAtom';
import { NavNode } from '../../types';

const makeNode = (overrides: Partial<NavNode> = {}): NavNode => ({
  resourceType: 'pods',
  resourceTypeCased: 'Pods',
  category: 'Workloads',
  namespaced: true,
  label: 'Pods',
  pathSegment: 'pods',
  requiredFeatures: [],
  apiVersion: 'v1',
  apiGroup: '',
  ...overrides,
});

describe('mergeInExtensibilityNav', () => {
  it('returns original nodes unchanged when extensionNodes is empty', () => {
    const nodes = [makeNode({ label: 'Pods', pathSegment: 'pods' })];
    const result = mergeInExtensibilityNav(nodes, []);
    expect(result).toEqual(nodes);
    expect(result).not.toBe(nodes); // returns a copy
  });

  it('adds a new extension node when no matching busola node exists', () => {
    const nodes = [makeNode({ label: 'Pods', pathSegment: 'pods' })];
    const extNode = makeNode({
      label: 'Custom',
      pathSegment: 'custom',
      resourceType: 'customs',
    });
    const result = mergeInExtensibilityNav(nodes, [extNode]);
    expect(result).toHaveLength(2);
    expect(result[1]).toEqual(extNode);
  });

  it('replaces an existing busola node when label and pathSegment match', () => {
    const original = makeNode({
      label: 'Pods',
      pathSegment: 'pods',
      icon: 'old-icon',
    });
    const extNode = makeNode({
      label: 'Pods',
      pathSegment: 'pods',
      icon: 'new-icon',
    });
    const result = mergeInExtensibilityNav([original], [extNode]);
    expect(result).toHaveLength(1);
    expect(result[0].icon).toBe('new-icon');
  });

  it('skips extension nodes where label is missing', () => {
    const nodes = [makeNode()];
    const extNode = makeNode({ label: '', pathSegment: 'pods' });
    const result = mergeInExtensibilityNav(nodes, [extNode]);
    expect(result).toEqual(nodes);
  });

  it('skips extension nodes where pathSegment is missing', () => {
    const nodes = [makeNode()];
    const extNode = makeNode({ label: 'Pods', pathSegment: '' });
    const result = mergeInExtensibilityNav(nodes, [extNode]);
    expect(result).toEqual(nodes);
  });

  it('handles multiple extension nodes: replaces one, adds another', () => {
    const podNode = makeNode({ label: 'Pods', pathSegment: 'pods' });
    const nodes = [podNode];
    const replacedExt = makeNode({
      label: 'Pods',
      pathSegment: 'pods',
      icon: 'replaced',
    });
    const newExt = makeNode({
      label: 'Jobs',
      pathSegment: 'jobs',
      resourceType: 'jobs',
    });
    const result = mergeInExtensibilityNav(nodes, [replacedExt, newExt]);
    expect(result).toHaveLength(2);
    expect(result[0].icon).toBe('replaced');
    expect(result[1].label).toBe('Jobs');
  });

  it('does not mutate the original nodes array', () => {
    const nodes = [makeNode()];
    const original = [...nodes];
    mergeInExtensibilityNav(nodes, [
      makeNode({ label: 'Custom', pathSegment: 'custom' }),
    ]);
    expect(nodes).toEqual(original);
  });
});
