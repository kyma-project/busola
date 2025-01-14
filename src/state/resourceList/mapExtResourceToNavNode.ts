import { getExtensibilityPath } from 'components/Extensibility/helpers/getExtensibilityPath';
import pluralize from 'pluralize';

import { configFeaturesNames, ExtResource, NavNode } from '../types';

export const mapExtResourceToNavNode = (extRes: ExtResource) => {
  const node: NavNode = {} as NavNode;

  node.category = extRes.general.category;
  node.icon = extRes.general.icon;
  node.resourceType = pluralize(extRes.general.resource.kind).toLowerCase();
  node.pathSegment = getExtensibilityPath(extRes.general);
  node.label = extRes.general.name || node.resourceType;
  node.namespaced = extRes.general.scope === 'namespace';
  node.apiGroup = extRes.general.resource.group || '';
  node.apiVersion = extRes.general.resource.version;
  if (extRes.general.customElement) {
    node.requiredFeatures = [
      configFeaturesNames.EXTENSIBILITY_CUSTOM_COMPONENTS,
    ];
  }

  return node;
};
