import {
  hasPermissionsFor,
  hasWildcardPermission,
  doesResourceExist,
  doesUserHavePermission,
} from './permissions';
import { clusterOpenApi } from './clusterOpenApi';

export const excludeNavigationNode = (node, groupVersions, permissionSet) => {
  if (dependsOnConfigFeatures(node)) {
    if (isARequiredFeatureDisabled(node)) {
      markNavNodeToBeDeleted(node);
    }
  } else if (dependsOnOtherResource(node)) {
    //used only for the Custom Resources node
    if (isParentResourceDisallowed(node, permissionSet)) {
      markNavNodeToBeDeleted(node);
    }
  } else if (hasCompleteInformation(node)) {
    if (isResourceDisallowed(node, permissionSet)) {
      markNavNodeToBeDeleted(node);
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

const dependsOnOtherResource = node =>
  typeof node.context?.requiredGroupResource === 'object';

const isParentResourceDisallowed = (node, permissionSet) => {
  const { group, resource } = node.context.requiredGroupResource;

  const doesExist = doesResourceExist(group, resource);
  const isPermitted = doesUserHavePermission(
    { groupName: group, resourceName: resource },
    permissionSet,
  );

  return !doesExist || !isPermitted;
};

const isResourceDisallowed = (node, permissionSet) => {
  const apiPath = new URL(node.viewUrl).searchParams.get('resourceApiPath');
  const resourceGroup = apiPath.replace(/^\/apis?\//, '');

  const doesExist = doesResourceExist(resourceGroup, node.resourceType);
  const isPermitted = doesUserHavePermission(
    { groupName: resourceGroup, resourceName: node.resourceType },
    permissionSet,
  );

  return !doesExist || !isPermitted;
};

const hasCompleteInformation = node => {
  if (typeof node.viewUrl === 'string') {
    const apiPath = new URL(node.viewUrl || '').searchParams.get(
      'resourceApiPath',
    );

    return apiPath && node.resourceType;
  }
  return false;
};
