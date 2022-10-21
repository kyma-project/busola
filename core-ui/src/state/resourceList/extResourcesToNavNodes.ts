import { ExtResource, NavNode } from '../types';

export const extResourcesToNavNodes = (extRes: ExtResource) => {
  const node: NavNode = {} as NavNode;

  node.category = extRes.general.category;
  node.icon = extRes.general.icon;
  node.resourceType = extRes.general.resource.kind.toLowerCase();
  node.pathSegment =
    extRes.general.urlPath || extRes.general.resource.kind.toLowerCase();
  node.label = extRes.general.name || node.resourceType;
  node.namespaced = extRes.general.scope === 'namespace';
  node.apiGroup = extRes.general.resource.group || '';
  node.apiVersion = extRes.general.resource.version;

  return node;
};
