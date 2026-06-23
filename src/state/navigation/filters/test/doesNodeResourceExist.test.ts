import { describe, it, expect } from 'vitest';
import { doesNodeResourceExist } from '../doesNodeResourceExist';
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

const resourceIdList = [
  '/api/v1/pods',
  '/api/v1/namespaces/{namespace}/secrets/{name}',
  '/apis/rbac.authorization.k8s.io/v1/clusterroles',
  '/apis/apps/v1/deployments',
];

describe('doesNodeResourceExist', () => {
  it('returns true for a core API resource (no apiGroup)', () => {
    const node = {
      ...baseNode,
      apiGroup: '',
      apiVersion: 'v1',
      resourceType: 'pods',
    };
    expect(doesNodeResourceExist(node, resourceIdList)).toBe(true);
  });

  it('returns false for a core API resource not in the list', () => {
    const node = {
      ...baseNode,
      apiGroup: '',
      apiVersion: 'v1',
      resourceType: 'configmaps',
    };
    expect(doesNodeResourceExist(node, resourceIdList)).toBe(false);
  });

  it('returns true for a grouped API resource (apiGroup set)', () => {
    const node = {
      ...baseNode,
      apiGroup: 'rbac.authorization.k8s.io',
      apiVersion: 'v1',
      resourceType: 'clusterroles',
    };
    expect(doesNodeResourceExist(node, resourceIdList)).toBe(true);
  });

  it('returns false for a grouped API resource not in the list', () => {
    const node = {
      ...baseNode,
      apiGroup: 'rbac.authorization.k8s.io',
      apiVersion: 'v1',
      resourceType: 'rolebindings',
    };
    expect(doesNodeResourceExist(node, resourceIdList)).toBe(false);
  });

  it('returns true for apps/v1 deployments', () => {
    const node = {
      ...baseNode,
      apiGroup: 'apps',
      apiVersion: 'v1',
      resourceType: 'deployments',
    };
    expect(doesNodeResourceExist(node, resourceIdList)).toBe(true);
  });

  it('returns false for an empty resourceIdList', () => {
    expect(doesNodeResourceExist(baseNode, [])).toBe(false);
  });
});
