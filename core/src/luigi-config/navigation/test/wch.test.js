import { doesResourceExist, doesUserHavePermission } from './../permissions';

const resourceNameList = [
  '/api/v1/pods',
  '/api/v1/namespaces/{namespace}/secrets/{name}',
  '/apis/rbac.authorization.k8s.io/v1/clusterroles',
];

jest.mock('../clusterOpenApi', () => ({
  clusterOpenApi: {
    getResourceNameList: resourceNameList,
  },
}));

describe('doesResourceExist', () => {
  test('if it returns correct values', () => {
    expect(
      doesResourceExist({ resourceGroup: 'v1', resourceKind: 'pod' }),
    ).toBe(true);

    expect(
      doesResourceExist({ resourceGroup: 'v1', resourceKind: 'pods' }),
    ).toBe(true);

    expect(
      doesResourceExist({
        resourceGroup: 'rbac.authorization.k8s.io/v1',
        resourceKind: 'clusterroles',
      }),
    ).toBe(true);

    expect(
      doesResourceExist({ resourceGroup: 'v1', resourceKind: 'secrets' }),
    ).toBe(false);
  });
});

//apiextensions.k8s.io/v1; ('customresourcedefinitions');
// apps/v1 deployment
//busola.example.com/v1   pizzaorder

const crd = {
  resourceGroup: 'apiextensions.k8s.io/v1',
  resourceKind: 'customresourcedefinitions',
};
const deployment = { resourceGroup: 'apps/v1', resourceKind: 'deployments' };
const pizza = {
  resourceGroup: 'busola.example.com/v1',
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
      apiGroups: ['apiextensions.k8s.io', 'apps'], // missing pizzaordergroup 'busola.example.com'
      resources: ['customresourcedefinitions', 'deployments', 'pizzaorders'],
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
  });
  //
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
