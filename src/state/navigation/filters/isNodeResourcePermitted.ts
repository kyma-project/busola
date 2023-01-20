import { doesUserHavePermission } from './permissions';
import { NavNode } from '../../types';
import { PermissionSet } from '../../permissionSetsSelector';

export const isNodeResourcePermitted = (
  node: NavNode,
  permissionSet: PermissionSet[],
) => {
  const resourceGroupAndVersion = `${node.apiGroup}${node.apiGroup ? '/' : ''}${
    node.apiVersion
  }`;

  const isPermitted = doesUserHavePermission(
    ['get', 'list'],
    { resourceGroupAndVersion, resourceKind: node.resourceType },
    permissionSet,
  );

  return isPermitted;
};
