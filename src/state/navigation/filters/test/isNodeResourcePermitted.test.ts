import { describe, it, expect } from 'vitest';
import { isNodeResourcePermitted } from '../isNodeResourcePermitted';
import { NavNode } from '../../../types';
import { PermissionSet } from '../../../permissionSetsAtom';

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

const wildcardPermissions: PermissionSet = {
  verbs: ['*'],
  apiGroups: ['*'],
  resources: ['*'],
};

describe('isNodeResourcePermitted', () => {
  it('returns true when user has wildcard permissions', () => {
    expect(isNodeResourcePermitted(baseNode, [wildcardPermissions])).toBe(true);
  });

  it('returns true when user has explicit get+list on the resource', () => {
    const permissions: PermissionSet = {
      verbs: ['get', 'list'],
      apiGroups: [''],
      resources: ['pods'],
    };
    expect(isNodeResourcePermitted(baseNode, [permissions])).toBe(true);
  });

  it('returns false when user only has create (not get/list)', () => {
    const permissions: PermissionSet = {
      verbs: ['create'],
      apiGroups: ['*'],
      resources: ['*'],
    };
    expect(isNodeResourcePermitted(baseNode, [permissions])).toBe(false);
  });

  it('returns false when permissionSet is empty', () => {
    expect(isNodeResourcePermitted(baseNode, [])).toBe(false);
  });

  it('builds apiGroup/apiVersion correctly for grouped resources', () => {
    const deploymentNode: NavNode = {
      ...baseNode,
      apiGroup: 'apps',
      apiVersion: 'v1',
      resourceType: 'deployments',
    };
    const permissions: PermissionSet = {
      verbs: ['get', 'list'],
      apiGroups: ['apps'],
      resources: ['deployments'],
    };
    expect(isNodeResourcePermitted(deploymentNode, [permissions])).toBe(true);
  });
});
