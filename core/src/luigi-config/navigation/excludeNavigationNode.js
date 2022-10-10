import { doesResourceExist, doesUserHavePermission } from './permissions';

export const excludeNavigationNode = (node, permissionSet) => {
  if (isNamespaceNode(node)) {
    //namespace node is required to load busola for the namespace scoped kubeconfigs
    return;
  }

  if (dependsOnConfigFeatures(node)) {
    if (isARequiredFeatureDisabled(node)) {
      markNavNodeToBeDeleted(node);
      return;
    }
  }

  if (dependsOnOtherResource(node)) {
    //used only for the Custom Resources node
    if (isParentResourceDisallowed(node, permissionSet)) {
      markNavNodeToBeDeleted(node);
      return;
    }
  }

  if (hasCompleteInformation(node)) {
    if (isResourceDisallowed(node, permissionSet)) {
      markNavNodeToBeDeleted(node);
    }
  }
};

const isParentResourceDisallowed = (node, permissionSet) => {
  const { group, resource } = node.context.requiredGroupResource;

  const doesExist = doesResourceExist({
    resourceGroupAndVersion: group,
    resourceKind: resource,
  });
  const isPermitted = doesUserHavePermission(
    ['get', 'list'],
    { resourceGroupAndVersion: group, resourceKind: resource },
    permissionSet,
  );

  return !doesExist || !isPermitted;
};

const isResourceDisallowed = (node, permissionSet) => {
  const apiPath = tryGetResourceApiPath(node.viewUrl);
  if (apiPath) {
    const resourceGroupAndVersion = apiPath.replace(/^\/apis?\//, '');

    const doesExist = doesResourceExist({
      resourceGroupAndVersion,
      resourceKind: node.resourceType,
    });
    const isPermitted = doesUserHavePermission(
      ['get', 'list'],
      { resourceGroupAndVersion, resourceKind: node.resourceType },
      permissionSet,
    );

    return !doesExist || !isPermitted;
  }
  return false;
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

const isNamespaceNode = node =>
  node.resourceType === 'namespace' || node.resourceType === 'namespaces';

const dependsOnOtherResource = node =>
  typeof node.context?.requiredGroupResource === 'object';

const hasCompleteInformation = node => {
  if (typeof node.viewUrl === 'string') {
    const apiPath = new URL(node.viewUrl || '').searchParams.get(
      'resourceApiPath',
    );

    return apiPath && node.resourceType;
  }
  return false;
};

const tryGetResourceApiPath = viewUrl => {
  try {
    return new URL(viewUrl).searchParams.get('resourceApiPath');
  } catch (_) {
    return null;
  }
};
