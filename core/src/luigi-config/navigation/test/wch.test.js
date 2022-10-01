import { doesUserHavePermission, doesResourceExist } from './../permissions';

describe('doesResourceExist', () => {
  test('true for exact group & resource', () => {
    const exactPermissions = {
      // apiGroups: ['exact-group-name'],
      // resources: ['exact-resources'],
    };
    expect().toBe(true);
    // hasPermissionsFor('exact-group-name', 'exact-resources', [
    //     exactPermissions,
    // ]),
  });
});
