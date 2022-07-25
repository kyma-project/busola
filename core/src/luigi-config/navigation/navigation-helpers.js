import i18next from 'i18next';
export const hideDisabledNodes = (disabledNavNodes, nodes, inNamespace) => {
  if (disabledNavNodes?.length > 0) {
    nodes.forEach(node => {
      // namespace node have pattern 'namespace.category.label' or 'namespace.label' if doesn't have category
      // cluster node have pattern 'category.label' or 'label' if doesn't have category
      const nodeCategory = node.category
        ? node.category.label
          ? node.category.label
              .split(' ')
              .join('')
              .toLowerCase()
          : node.category
              .split(' ')
              .join('')
              .toLowerCase()
        : '';
      const categoryId = inNamespace
        ? nodeCategory
          ? `namespace.${nodeCategory}`
          : 'namespace'
        : nodeCategory;

      const nodeLabel = node.label
        ? node.label
            .split(/ |-/)
            .join('')
            .toLowerCase()
        : '';
      const nodeId = `${categoryId}${
        categoryId && nodeLabel ? '.' : ''
      }${nodeLabel}`;

      const shouldBeDisabled = element =>
        element && (element === categoryId || element === nodeId);

      node.hideFromNav =
        disabledNavNodes.some(shouldBeDisabled) || node.hideFromNav;
    });
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
  let namespaces = [];
  rawNamespaceNames
    .sort((namespaceA, namespaceB) => {
      return namespaceA.name.localeCompare(namespaceB.name);
    })
    .forEach(namespace => {
      const namespaceName = namespace.name;
      const alternativeLocation = getCorrespondingNamespaceLocation(
        namespaceName,
      );
      namespaces.push({
        category: 'Namespaces',
        customRendererCategory: 'namespace',
        label: namespaceName,
        pathValue: alternativeLocation || namespaceName + '/details',
      });
    });
  namespaces.unshift({
    customRendererCategory: 'overview',
    label: i18next.t('namespaces.namespaces-overview'),
    pathValue: '/',
  });
  return namespaces;
}

export const addExternalNodes = externalNodesFeature => {
  if (externalNodesFeature?.isEnabled === false) return [];

  let navigationNodes = [];
  try {
    (externalNodesFeature?.nodes || []).forEach(node => {
      const { category = 'External Links', icon = 'action', children } = node;
      if (!children || children.length === 0) return;
      navigationNodes = [
        ...navigationNodes,
        {
          category: {
            label: category,
            icon,
            collapsible: true,
          },
          pathSegment: `${category.replace(' ', '_')}_placeholder`,
          hideFromNav: false,
        },
      ];

      children.forEach(child => {
        const { label, link } = child;
        navigationNodes = [
          ...navigationNodes,
          {
            label,
            category,
            viewUrl: '',
            externalLink: {
              url: link,
            },
          },
        ];
      });
    });
  } catch (e) {
    console.warn('Cannot setup externalNodes', e);
    return [];
  }

  return navigationNodes;
};

export function getCorrespondingNamespaceLocation(namespaceName) {
  const addressTokens = window.location.pathname.split('/');
  // check if we are in namespaces context
  if (addressTokens[3] !== 'namespaces') {
    return null;
  }
  // check if any path after namespace name exists - if not,
  // it will default to namespace name (and then to '/details')
  if (!addressTokens[5]) {
    return null;
  }
  const fullPath = addressTokens.slice(5).join('/');
  // navigate to the list view from the details
  const path =
    fullPath === 'details' ? fullPath : fullPath.split('/details')[0];
  return `${namespaceName}/${path}`;
}
