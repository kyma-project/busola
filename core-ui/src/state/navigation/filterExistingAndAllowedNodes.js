import { doesResourceExist, doesUserHavePermission } from './permissions';

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

  return isResourceAllowed(node, permissionSet, resourceIdList);
};

const isResourceAllowed = (node, permissionSet, resourceIdList) => {
  const resourceGroupAndVersion = `${node.apiGroup}${node.apiGroup ? '/' : ''}${
    node.apiVersion
  }`;

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

  return doesExist && isPermitted;
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
