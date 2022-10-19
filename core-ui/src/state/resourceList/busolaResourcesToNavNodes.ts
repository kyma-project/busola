import { NavNode } from '../types';

type PartialNavNode = Partial<NavNode> & Pick<NavNode, 'resourceType'>;

export const busolaResourcesToNavNodes = (resource: PartialNavNode) => {
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
