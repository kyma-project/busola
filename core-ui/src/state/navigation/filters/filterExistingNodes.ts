import { doesResourceExist } from './permissions';
import { NavNode } from '../../types';

export const filterExistingNodes = (
  nodes: NavNode[],
  resourceIdList: string[],
) => {
  return nodes.filter(node => isResourcePresent(node, resourceIdList));
};

const isResourcePresent = (node: NavNode, resourceIdList: string[]) => {
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
