import { doesUserHavePermission, doesResourceExist } from './../permissions';
import * as clusterOpenApi from '../clusterOpenApi';

const resourceNameList = [
  '/api/v1/pods',
  '/api/v1/namespaces/{namespace}/secrets/{name}',
  '/apis/rbac.authorization.k8s.io/v1/clusterroles',
];

clusterOpenApi.getResourceNameList = jest
  .fn()
  .mockReturnValue(resourceNameList);

describe('doesResourceExist', () => {
  test('true for exact group & resource', () => {
    const doesResourceExistReturns = (resource, result) =>
      expect(doesResourceExist(resource).toBe(result));

    doesResourceExistReturns(
      { resourceGroup: 'v1', resourceKind: 'pod' },
      true,
    );
    // doesResourceExistReturns(
    //   { resourceGroup: 'v1', resourceKind: 'pods' },
    //   true,
    // );
    // doesResourceExistReturns(
    //   {
    //     resourceGroup: 'rbac.authorization.k8s.io/v1',
    //     resourceKind: 'clusterroles',
    //   },
    //   true,
    // );
    // doesResourceExistReturns(
    //   { resourceGroup: 'v1', resourceKind: 'secrets' },
    //   true,
    // );
  });
});
