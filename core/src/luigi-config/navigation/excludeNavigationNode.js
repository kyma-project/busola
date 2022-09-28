import {
  hasPermissionsFor,
  hasWildcardPermission,
  hasPermission,
  doesResourceExist,
  doesUserHavePermission,
} from './permissions';
import { clusterOpenApi } from './clusterOpenApi';

function extractApiGroup(apiPath) {
  if (apiPath === '/api/v1') {
    return ''; // core api group
  }
  return apiPath.split('/')[2];
}

export const excludeNavigationNode = (node, groupVersions, permissionSet) => {
  // console.log(1234, groupVersions, permissionSet);

  if (dependsOnConfigFeatures(node)) {
    if (isARequiredFeatureDisabled(node)) {
      markNavNodeToBeDeleted(node);
    }
  } else if (hasRequiredGroupResource(node)) {
    //used only for Custom Resources node
    if (isRequiredGroupResourceNotPermitted(node, permissionSet)) {
      markNavNodeToBeDeleted(node);
    }
  }

  if (!node.viewUrl || !node.resourceType) {
    // does only CustomResource shouldIncludeCustomResource
    // console.log('viewUrl', node);
    // used for Custom Resources node
    if (node.context?.requiredGroupResource) {
      const { group, resource } = node.context.requiredGroupResource;
      if (!hasPermissionsFor(group, resource, permissionSet)) {
        node.toDelete = true;
      }
    }
    return;
  }

  const apiPath = new URL(node.viewUrl).searchParams.get('resourceApiPath');
  if (!apiPath) return;
  // console.log(apiPath);
  if (hasWildcardPermission(permissionSet)) {
    // we have '*' in permissions, just check if this resource exists
    const groupVersion = apiPath
      .replace(/^\/apis\//, '')
      .replace(/^\/api\//, '');

    if (!groupVersions.find(g => g.includes(groupVersion))) {
      node.toDelete = true;
      return;
    }
  } else {
    // we need to filter through permissions to check the node availability
    const apiGroup = extractApiGroup(apiPath);
    if (!hasPermissionsFor(apiGroup, node.resourceType, permissionSet)) {
      node.toDelete = true;
      return;
    }
  }
};

const markNavNodeToBeDeleted = node => {
  node.toDelete = true;
  return node;
};

const dependsOnConfigFeatures = node =>
  Array.isArray(node.context?.requiredFeatures) &&
  node.context.requiredFeatures.length;

const isARequiredFeatureDisabled = node =>
  !!node.context.requiredFeatures.find(
    configFeature => !configFeature || configFeature.isEnabled === false,
  );

const hasRequiredGroupResource = node =>
  typeof node.context?.requiredGroupResource === 'object';

const isRequiredGroupResourceNotPermitted = (node, permissionSet) => {
  const { group, resource } = node.context.requiredGroupResource;

  const doesExist = doesResourceExist(group, resource);
  const isPermitted = doesUserHavePermission(group, resource, permissionSet);
  console.log(doesExist);

  return true;
};
