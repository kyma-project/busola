import {
  hasPermissionsFor,
  hasWildcardPermission,
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
  } else if (dependsOnOtherResource(node)) {
    //used only for the Custom Resources node
    if (isParentResourceDisallowed(node, permissionSet)) {
      markNavNodeToBeDeleted(node);
    }
  } else if (hasCompleteInformation(node)) {
    if (isResourceDisallowed(node, permissionSet)) {
      markNavNodeToBeDeleted(node);
    }

    // console.log(node.resourceType, apiPath);

    //"/api/v1/namespaces/{namespace}/serviceaccounts",

    // const doesExist = doesResourceExist()
    // const isPermitted = doesUserHavePermission(
    //     { groupName: group, resourceName: resource },
    //     permissionSet,
    // );
  }
  //
  // if (!node.viewUrl || !node.resourceType) {
  //   // does only CustomResource shouldIncludeCustomResource
  //   // console.log('viewUrl', node);
  //   // used for Custom Resources node
  //   // if (node.context?.requiredGroupResource) {
  //   //   const { group, resource } = node.context.requiredGroupResource;
  //   //   if (!hasPermissionsFor(group, resource, permissionSet)) {
  //   //     node.toDelete = true;
  //   //   }
  //   // }
  //   return;
  // }

  // console.log(apiPath);
  // if (hasWildcardPermission(permissionSet)) {
  //   // we have '*' in permissions, just check if this resource exists
  //   const groupVersion = apiPath
  //     .replace(/^\/apis\//, '')
  //     .replace(/^\/api\//, '');
  //
  //   if (!groupVersions.find(g => g.includes(groupVersion))) {
  //     node.toDelete = true;
  //     return;
  //   }
  // } else {
  //   // we need to filter through permissions to check the node availability
  //   const apiGroup = extractApiGroup(apiPath);
  //   if (!hasPermissionsFor(apiGroup, node.resourceType, permissionSet)) {
  //     node.toDelete = true;
  //     return;
  //   }
  // }
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
