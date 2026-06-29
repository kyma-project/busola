import { describe, it, expect } from 'vitest';
import { hasCurrentScope } from '../hasCurrentScope';
import { NavNode } from '../../../types';

const baseNode: NavNode = {
  resourceType: 'pods',
  resourceTypeCased: 'Pods',
  category: 'Workloads',
  namespaced: true,
  label: 'Pods',
  pathSegment: 'pods',
  requiredFeatures: [],
  apiVersion: 'v1',
  apiGroup: '',
};

describe('hasCurrentScope', () => {
  it('returns true for namespace scope when node is namespaced', () => {
    expect(
      hasCurrentScope('namespace', { ...baseNode, namespaced: true }),
    ).toBe(true);
  });

  it('returns false for namespace scope when node is not namespaced', () => {
    expect(
      hasCurrentScope('namespace', { ...baseNode, namespaced: false }),
    ).toBe(false);
  });

  it('returns true for cluster scope when node is not namespaced', () => {
    expect(hasCurrentScope('cluster', { ...baseNode, namespaced: false })).toBe(
      true,
    );
  });

  it('returns false for cluster scope when node is namespaced', () => {
    expect(hasCurrentScope('cluster', { ...baseNode, namespaced: true })).toBe(
      false,
    );
  });
});
