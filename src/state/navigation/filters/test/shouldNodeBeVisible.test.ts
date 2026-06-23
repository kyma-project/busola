import { describe, it, expect } from 'vitest';
import { shouldNodeBeVisible } from '../shouldNodeBeVisible';
import { NavNode } from '../../../types';
import { ConfigFeatureList } from '../../../types';
import { PermissionSet } from '../../../permissionSetsAtom';
import { NavConfigSet } from '../shouldNodeBeVisible';

const resourceIdList = ['/api/v1/pods', '/api/v1/namespaces'];

const wildcardPermissions: PermissionSet = {
  verbs: ['*'],
  apiGroups: ['*'],
  resources: ['*'],
};

const fullConfigSet: NavConfigSet = {
  configFeatures: {},
  openapiPathIdList: resourceIdList,
  permissionSet: [wildcardPermissions],
};

const podNode: NavNode = {
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

const namespaceNode: NavNode = {
  resourceType: 'namespaces',
  resourceTypeCased: 'Namespaces',
  category: 'Configuration',
  namespaced: false,
  label: 'Namespaces',
  pathSegment: 'namespaces',
  requiredFeatures: [],
  apiVersion: 'v1',
  apiGroup: '',
};

describe('shouldNodeBeVisible', () => {
  it('returns true when all checks pass', () => {
    expect(shouldNodeBeVisible(fullConfigSet, podNode)).toBe(true);
  });

  it('returns false when a required feature is disabled', () => {
    const node: NavNode = {
      ...podNode,
      requiredFeatures: ['EXTENSIBILITY' as const],
    };
    const configSet: NavConfigSet = {
      ...fullConfigSet,
      configFeatures: {
        EXTENSIBILITY: { isEnabled: false },
      } as ConfigFeatureList,
    };
    expect(shouldNodeBeVisible(configSet, node)).toBe(false);
  });

  it('returns false when the resource does not exist in openapi paths', () => {
    const configSet: NavConfigSet = {
      ...fullConfigSet,
      openapiPathIdList: [],
    };
    expect(shouldNodeBeVisible(configSet, podNode)).toBe(false);
  });

  it('returns false when user does not have get/list permission', () => {
    const configSet: NavConfigSet = {
      ...fullConfigSet,
      permissionSet: [
        { verbs: ['create'], apiGroups: ['*'], resources: ['*'] },
      ],
    };
    expect(shouldNodeBeVisible(configSet, podNode)).toBe(false);
  });

  it('for namespaces node: skips permission check, returns true if features enabled and resource exists', () => {
    const configSet: NavConfigSet = {
      ...fullConfigSet,
      permissionSet: [],
    };
    expect(shouldNodeBeVisible(configSet, namespaceNode)).toBe(true);
  });

  it('for namespaces node: returns false if feature is disabled', () => {
    const node: NavNode = {
      ...namespaceNode,
      requiredFeatures: ['EXTENSIBILITY' as const],
    };
    const configSet: NavConfigSet = {
      ...fullConfigSet,
      configFeatures: {
        EXTENSIBILITY: { isEnabled: false },
      } as ConfigFeatureList,
      permissionSet: [],
    };
    expect(shouldNodeBeVisible(configSet, node)).toBe(false);
  });

  it('for namespaces node: returns false if resource does not exist', () => {
    const configSet: NavConfigSet = {
      ...fullConfigSet,
      openapiPathIdList: [],
      permissionSet: [],
    };
    expect(shouldNodeBeVisible(configSet, namespaceNode)).toBe(false);
  });
});
