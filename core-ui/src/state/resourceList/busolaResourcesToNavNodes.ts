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
  node.apiGroup = resource.apiGroup || ''; //TODO provide apiGroup in all resourece
  node.apiVersion = resource.apiVersion || ''; //TODO provide apiVersion in all resourece
  return node;
};
