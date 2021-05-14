import { hasPermissionsFor } from './../permissions';

describe('hasPermissionsFor', () => {
  test('true for exact group & resource', () => {
    const exactPermissions = {
      apiGroups: ['exact-group-name'],
      resources: ['exact-resource'],
    };
    expect(
      hasPermissionsFor('exact-group-name', 'exact-resource', [
        exactPermissions,
      ])
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
      ])
    ).toBe(true);
  });

  test('true for matching resource and wildcard group', () => {
    const wildcardApiGroupPermissions = {
      apiGroups: ['*'],
      resources: ['resource'],
    };
    expect(
      hasPermissionsFor('api-group', 'resource', [wildcardApiGroupPermissions])
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
    expect(hasPermissionsFor('api-group', 'resource', permissionSet)).toBe(
      false
    );
  });
});
