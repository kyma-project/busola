import { doesResourceExist, doesUserHavePermission } from './../permissions';

const resourceNameList = [
  '/api/v1/pods',
  '/api/v1/namespaces/{namespace}/secrets/{name}',
  '/apis/rbac.authorization.k8s.io/v1/clusterroles',
];

jest.mock('../clusterOpenApi', () => ({
  clusterOpenApi: {
    getResourcePathIdList: resourceNameList,
  },
}));

describe('doesResourceExist', () => {
  test('if it returns correct values', () => {
    expect(
      doesResourceExist({ resourceGroupAndVersion: 'v1', resourceKind: 'pod' }),
    ).toBe(true);

    expect(
      doesResourceExist({
        resourceGroupAndVersion: 'v1',
        resourceKind: 'pods',
      }),
    ).toBe(true);

    expect(
      doesResourceExist({
        resourceGroupAndVersion: 'rbac.authorization.k8s.io/v1',
        resourceKind: 'clusterroles',
      }),
    ).toBe(true);

    expect(
      doesResourceExist({
        resourceGroupAndVersion: 'v1',
        resourceKind: 'secrets',
      }),
    ).toBe(false);
  });
});

const crd = {
  resourceGroupAndVersion: 'apiextensions.k8s.io/v1',
  resourceKind: 'customresourcedefinitions',
};
const deployment = {
  resourceGroupAndVersion: 'apps/v1',
  resourceKind: 'deployments',
};

const pod = {
  resourceGroupAndVersion: 'v1',
  resourceKind: 'pods',
};

const pizza = {
  resourceGroupAndVersion: 'busola.example.com/v1',
  resourceKind: 'pizzas',
};

describe('doesUserHavePermission', () => {
  test('checks wildcard permissions', () => {
    const wildcardPermissions = {
      verbs: ['*'],
      apiGroups: ['*'],
      resources: ['*'],
    };

    expect(
      doesUserHavePermission(['get', 'list'], crd, [wildcardPermissions]),
    ).toBe(true);

    expect(
      doesUserHavePermission(['watch'], deployment, [wildcardPermissions]),
    ).toBe(true);

    //checks for '*' permissions
    expect(doesUserHavePermission([], pizza, [wildcardPermissions])).toBe(true);
  });

  test('checks selected resources permissions', () => {
    const selectedResourcesPermissions = {
      verbs: ['*'],
      apiGroups: ['apiextensions.k8s.io', 'apps', ''], // '' is the apiGroup for native resources
      resources: ['customresourcedefinitions', 'deployments', 'pods'],
    };

    expect(
      doesUserHavePermission(['get', 'list'], crd, [
        selectedResourcesPermissions,
      ]),
    ).toBe(true);

    expect(
      doesUserHavePermission(['create', 'get'], pizza, [
        selectedResourcesPermissions,
      ]),
    ).toBe(false);

    expect(
      doesUserHavePermission(['list'], pod, [selectedResourcesPermissions]),
    ).toBe(true);
  });
  test('checks selected verbs permissions', () => {
    const selectedVerbsPermissions = {
      verbs: ['list'],
      apiGroups: ['*'],
      resources: ['*'],
    };

    expect(
      doesUserHavePermission(['get'], crd, [selectedVerbsPermissions]),
    ).toBe(false);

    expect(
      doesUserHavePermission(['create'], crd, [selectedVerbsPermissions]),
    ).toBe(false);

    expect(
      doesUserHavePermission(['list'], crd, [selectedVerbsPermissions]),
    ).toBe(true);
  });
});
