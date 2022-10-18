import { NavNode } from '../types';

export const busolaResourcesToNavNodes = (
  resource: Partial<NavNode> & Pick<NavNode, 'resourceType'>,
) => {
  const node: NavNode = {} as NavNode;

  node.category = resource.category || 'temporary';
  node.resourceType = resource.resourceType.toLowerCase();
  node.pathSegment = (
    resource.pathSegment || resource.resourceType
  ).toLowerCase();
  node.label =
    resource.label || resource.resourceType.split(/(?=[A-Z])/).join(' ');
  node.namespaced = !!resource.namespaced;
  node.requiredFeatures = resource.requiredFeatures || [];
  node.apiGroup = resource.apiGroup || '';
  node.apiVersion = resource.apiVersion || '';
  node.icon = resource.icon;
  return node;
};
