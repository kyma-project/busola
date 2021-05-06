import { clearAuthData } from './../auth-storage';

export const hideDisabledNodes = (disabledNavNodes, nodes, inNamespace) => {
  if (disabledNavNodes !== null && disabledNavNodes !== undefined) {
    const disabledNavNodesArray = disabledNavNodes.split(' ');
    if (disabledNavNodesArray && disabledNavNodesArray.length > 0) {
      nodes.forEach((node) => {
        // namespace node have pattern 'namespace.category.label' or 'namespace.label' if doesn't have category
        // cluster node have pattern 'category.label' or 'label' if doesn't have category
        const nodeCategory = node.category
          ? node.category.label
            ? node.category.label.split(' ').join('').toLowerCase()
            : node.category.split(' ').join('').toLowerCase()
          : '';
        const categoryId = inNamespace
          ? nodeCategory
            ? `namespace.${nodeCategory}`
            : 'namespace'
          : nodeCategory;

        const nodeLabel = node.label
          ? node.label.split(/ |-/).join('').toLowerCase()
          : '';
        const nodeId = `${categoryId}${
          categoryId && nodeLabel ? '.' : ''
        }${nodeLabel}`;

        const shouldBeDisabled = (element) =>
          element && (element === categoryId || element === nodeId);
        node.hideFromNav =
          disabledNavNodesArray.some(shouldBeDisabled) || node.hideFromNav;
      });
    }
  }
};

export function hideByNodeCategory(node, showExperimentalCategory) {
  if (node.category === 'Experimental') {
    return { ...node, hideFromNav: !showExperimentalCategory };
  } else {
    return node;
  }
}

export function createNamespacesList(rawNamespaceNames) {
  var namespaces = [];
  rawNamespaceNames
    .sort((namespaceA, namespaceB) => {
      return namespaceA.name.localeCompare(namespaceB.name);
    })
    .map((namespace) => {
      const namespaceName = namespace.name;
      const alternativeLocation = getCorrespondingNamespaceLocation(
        namespaceName
      );
      namespaces.push({
        category: 'Namespaces',
        label: namespaceName,
        pathValue: alternativeLocation || namespaceName + '/details',
      });
    });
  return namespaces;
}

export function setLimitExceededErrorsMessages(limitExceededErrors) {
  let limitExceededErrorscomposed = [];
  limitExceededErrors.forEach((resource) => {
    if (resource.affectedResources && resource.affectedResources.length > 0) {
      resource.affectedResources.forEach((affectedResource) => {
        limitExceededErrorscomposed.push(
          `'${resource.resourceName}' by '${affectedResource}' (${resource.quotaName})`
        );
      });
    }
  });
  return limitExceededErrorscomposed;
}

function getCorrespondingNamespaceLocation(namespaceName) {
  console.log('getCorrespondingNamespaceLocation');
  const addressTokens = window.location.pathname.split('/');
  // check if we are in namespaces context
  if (addressTokens[2] !== 'namespaces') {
    return null;
  }
  // check if any path after namespace name exists - if not,
  // it will default to namespace name (and then to '/details')
  if (!addressTokens[4]) {
    return null;
  }
  const fullPath = addressTokens.slice(4).join('/');
  // navigate to the list view from the details
  const path =
    fullPath === 'details' ? fullPath : fullPath.split('/details')[0];
  return `${namespaceName}/${path}`;
}
