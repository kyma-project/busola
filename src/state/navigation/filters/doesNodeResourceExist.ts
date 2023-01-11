import { doesResourceExist } from './permissions';
import { NavNode } from '../../types';

export const doesNodeResourceExist = (
  node: NavNode,
  resourceIdList: string[],
) => {
  const resourceGroupAndVersion = `${node.apiGroup}${node.apiGroup ? '/' : ''}${
    node.apiVersion
  }`;

  const doesExist = doesResourceExist({
    resourceGroupAndVersion,
    resourceKind: node.resourceType,
    resourceIdList,
  });

  return doesExist;
};
