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

export const shouldShowSystemNamespaces = () => {
  let showSystemNamespaces = false;
  if (localStorage.getItem('busola.showSystemNamespaces')) {
    showSystemNamespaces =
      localStorage.getItem('busola.showSystemNamespaces') === 'true';
  }
  return showSystemNamespaces;
};

export const saveCurrentLocation = () => {
  if (!window.location.hash) {
    const location = window.location.pathname;
    const params = window.location.search;
    localStorage.setItem('busola.location', location + params);
  }
};

export function relogin() {
  saveCurrentLocation();
  clearAuthData();
  location.reload();
}

export function clearAuthData() {
  Luigi.auth().store.removeAuthData();
}

export function getAuthData() {
  return Luigi.auth().store.getAuthData();
}

export const getPreviousLocation = () => {
  const prevLocation = localStorage.getItem('busola.location');
  if (prevLocation) {
    localStorage.removeItem('busola.location');
  }
  return prevLocation;
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

function getCorrespondingNamespaceLocation(namespaceName) {
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
