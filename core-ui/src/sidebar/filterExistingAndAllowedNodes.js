import { doesResourceExist, doesUserHavePermission } from './permissions';
import { apiGroup, apiVersion } from 'resources/Jobs';

export const filterExistingAndAllowedNodes = (
  node,
  permissionSet,
  resourceIdList,
  configFeatures,
) => {
  if (isNamespaceNode(node)) {
    //namespace node is required to load busola for the namespace scoped kubeconfigs
    return true;
  }

  if (dependsOnConfigFeatures(node)) {
    if (isARequiredFeatureDisabled(node, configFeatures)) {
      return false;
    }
  }

  if (dependsOnOtherResource(node)) {
    //used only for the Custom Resources node
    if (isParentResourceDisallowed(node, permissionSet, resourceIdList)) {
      return false;
    }
  }

  // if (hasCompleteNavigationInformation(node)) {
  if (isResourceDisallowed(node, permissionSet, resourceIdList)) {
    return false;
  }
  // }

  return true;
};

//TODO what about Custom Resources
const isParentResourceDisallowed = (node, permissionSet, resourceIdList) => {
  const { group, resource } = node.context.requiredGroupResource;

  const doesExist = doesResourceExist({
    resourceGroupAndVersion: group,
    resourceKind: resource,
    resourceIdList,
  });
  const isPermitted = doesUserHavePermission(
    ['get', 'list'],
    { resourceGroupAndVersion: group, resourceKind: resource },
    permissionSet,
  );

  return !doesExist || !isPermitted;
};

const isResourceDisallowed = (node, permissionSet, resourceIdList) => {
  const stringJoiner = node.apiGroup ? '/' : '';

  const resourceGroupAndVersion = `${node.apiGroup}${stringJoiner}${node.apiVersion}`;

  const doesExist = doesResourceExist({
    resourceGroupAndVersion,
    resourceKind: node.resourceType,
    resourceIdList,
  });
  const isPermitted = doesUserHavePermission(
    ['get', 'list'],
    { resourceGroupAndVersion, resourceKind: node.resourceType },
    permissionSet,
  );

  return !doesExist || !isPermitted;
};

const dependsOnConfigFeatures = node =>
  Array.isArray(node.requiredFeatures) && node.requiredFeatures.length;

const isARequiredFeatureDisabled = (node, configFeatures) => {
  return node.requiredFeatures.find(
    resourceRequiredFeatureKey =>
      configFeatures[resourceRequiredFeatureKey].isEnabled === false,
  );
};

const isNamespaceNode = node =>
  node.resourceType === 'namespace' || node.resourceType === 'namespaces';

const dependsOnOtherResource = node =>
  //what with requiredGroupResource

  typeof node.context?.requiredGroupResource === 'object';

// const hasCompleteNavigationInformation = node => {
//   if (typeof node.viewUrl === 'string') {
//     const apiPath = new URL(node.viewUrl || '').searchParams.get(
//       'resourceApiPath',
//     );
//
//     return apiPath && node.resourceType;
//   }
//   return false;
// };
