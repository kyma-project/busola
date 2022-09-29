import { hasPermissionsFor } from './../permissions';

describe('hasPermissionsFor', () => {
  test('true for exact group & resource', () => {
    const exactPermissions = {
      apiGroups: ['exact-group-name'],
      resources: ['exact-resources'],
    };
    expect(
      hasPermissionsFor('exact-group-name', 'exact-resources', [
        exactPermissions,
      ]),
    ).toBe(true);
  });

  test('true for matching group and wildcard resource', () => {
    const wildcardResourcesPermissions = {
      apiGroups: ['api-group'],
      resources: ['*'],
    };
    expect(
      hasPermissionsFor('api-group', 'exact-resource', [
        wildcardResourcesPermissions,
      ]),
    ).toBe(true);
  });

  test('true for matching resource and wildcard group', () => {
    const wildcardApiGroupPermissions = {
      apiGroups: ['*'],
      resources: ['resources'],
    };
    expect(
      hasPermissionsFor('api-group', 'resources', [
        wildcardApiGroupPermissions,
      ]),
    ).toBe(true);
  });

  test('false if match is not found', () => {
    const permissionSet = [
      {
        apiGroups: ['*'],
        resources: ['resource-1', 'resource-2'],
      },
      {
        apiGroups: ['group'],
        resources: ['*'],
      },
      {
        apiGroups: ['resource-3'],
        resources: ['group'],
      },
    ];
    expect(hasPermissionsFor('api-group', 'resources', permissionSet)).toBe(
      false,
    );
  });

  test('false if required verb is not found', () => {
    const permissionSet = [
      {
        apiGroups: ['*'],
        resources: ['*'],
        verbs: ['add', 'remove'],
      },
    ];
    expect(
      hasPermissionsFor('api-group', 'resources', permissionSet, [
        'add',
        'remove',
        'cancel',
      ]),
    ).toBe(false);
  });

  test('true for wildcard verb', () => {
    const permissionSet = [
      {
        apiGroups: ['*'],
        resources: ['*'],
        verbs: ['*'],
      },
    ];
    expect(
      hasPermissionsFor('api-group', 'resources', permissionSet, [
        'add',
        'remove',
      ]),
    ).toBe(true);
  });

  test('false if all required verb is not found', () => {
    const permissionSet = [
      {
        apiGroups: ['*'],
        resources: ['*'],
        verbs: ['tets'],
      },
    ];
    expect(
      hasPermissionsFor('api-group', 'resources', permissionSet, ['add']),
    ).toBe(false);
  });
});
