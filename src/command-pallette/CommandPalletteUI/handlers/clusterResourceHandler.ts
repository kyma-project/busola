import { NavNode } from 'state/types';
import {
  makeSuggestion,
  toFullResourceType,
  autocompleteForResources,
  extractShortNames,
  findNavigationNode,
  getApiPathForQuery,
  toFullResourceTypeList,
  getShortAliases,
} from './helpers';
import {
  clusterNativeResourceTypes,
  clusterNativeResourceTypes as resourceTypes,
} from 'shared/constants';
import {
  CommandPaletteContext,
  Handler,
  LOADING_INDICATOR,
  Result,
} from '../types';
import { K8sResource } from 'types';
import { matchPath } from 'react-router-dom';

function getAutocompleteEntries({
  tokens,
  resourceCache,
}: CommandPaletteContext) {
  const fullResourceType = toFullResourceType(tokens[0], resourceTypes);
  const resources = resourceCache[fullResourceType] || [];

  return autocompleteForResources({
    tokens,
    resources,
    resourceTypes,
  });
}

function getSuggestion({
  tokens,
  resourceCache,
}: CommandPaletteContext): string {
  const [type, , name] = tokens;
  const suggestedType = makeSuggestion(
    type,
    resourceTypes.flatMap(n => n.aliases),
  );

  if (name) {
    const fullResourceType = toFullResourceType(
      suggestedType || type,
      resourceTypes,
    );
    const resourceNames = (resourceCache[fullResourceType] || [])?.map(
      n => n.metadata.name,
    );
    const suggestedName = makeSuggestion(name, resourceNames);
    return `${suggestedType || type} ${suggestedName || name}`;
  } else {
    return suggestedType;
  }
}

function makeListItem(
  item: K8sResource,
  matchedNode: NavNode,
  context: CommandPaletteContext,
  customActionText: boolean,
) {
  const { t, activeClusterName, navigate } = context;
  const name = item.metadata.name;
  const { pathSegment, resourceType, category } = matchedNode;

  const resourceTypeText = t([
    `${resourceType}.title`,
    `command-palette.resource-names.${resourceType}`,
  ]);

  return {
    label: name,
    query: `${resourceType}/${name}`,
    // some resources have no category
    category: category ? category + ' > ' + resourceTypeText : resourceTypeText,
    onActivate: () => {
      const pathname = `/cluster/${encodeURIComponent(
        activeClusterName ?? '',
      )}/${pathSegment}/${name}`;
      navigate(pathname);
    },
    customActionText: customActionText
      ? 'command-palette.item-actions.navigate'
      : undefined,
  };
}

async function fetchClusterResources(context: CommandPaletteContext) {
  const { fetch, tokens, updateResourceCache, clusterNodes } = context;
  const apiPath = getApiPathForQuery(
    tokens,
    clusterNodes,
    clusterNativeResourceTypes,
  );
  if (!apiPath) {
    return;
  }

  const resourceType = toFullResourceType(tokens[0], resourceTypes);
  const matchedNode = findNavigationNode(resourceType, clusterNodes);

  if (!matchedNode) {
    return;
  }

  try {
    const response = await fetch(apiPath + '/' + resourceType);
    const { items } = await response.json();
    updateResourceCache(resourceType, items);
  } catch (e) {
    console.warn(e);
  }
}

function sendNamespaceSwitchMessage(
  newNamespace: string,
  activeClusterName: string,
  navigate: Function,
) {
  const matchedRoute =
    matchPath(
      '/cluster/:cluster/namespaces/:namespaceId',
      window.location.pathname,
    ) ||
    matchPath(
      '/cluster/:cluster/namespaces/:namespaceId/:resourceType/*',
      window.location.pathname,
    );
  if (!matchedRoute) return;

  // @ts-ignore
  const resourceType = matchedRoute.params.resourceType || '';

  navigate(
    `/cluster/${encodeURIComponent(
      activeClusterName,
    )}/namespaces/${newNamespace}/${resourceType}`,
  );
}

function makeSingleNamespaceLinks(
  namespace: K8sResource,
  context: CommandPaletteContext,
) {
  const { t, activeClusterName, navigate } = context;
  const category = t('namespaces.title');
  const label = namespace.metadata.name;
  const name = namespace.metadata.name;
  const query = `namespaces/${name}`;

  const switchContextNode = {
    label,
    category,
    query,
    onActivate: () =>
      sendNamespaceSwitchMessage(name, activeClusterName!, navigate),
    customActionText: t('command-palette.item-actions.switch'),
  };

  const navigateToDetailsNode = {
    label,
    category,
    query,
    onActivate: () => {
      const pathname = `/cluster/${encodeURIComponent(
        activeClusterName ?? '',
      )}/namespaces/${name}`;
      navigate(pathname);
    },
    customActionText: 'command-palette.item-actions.navigate',
  };

  // don't rely on currentNamespace, as it defaults to "default"
  const isAtNamespaceContext = !!matchPath(
    '/cluster/:cluster/namespaces/:namespaceId/*',
    window.location.pathname,
  );
  if (isAtNamespaceContext) {
    return [switchContextNode, navigateToDetailsNode];
  } else {
    return [navigateToDetailsNode];
  }
}

function createAllResults(context: CommandPaletteContext) {
  const { clusterNodes, activeClusterName, navigate } = context;

  return clusterNodes
    .filter((currentValue, index, arr) => arr.indexOf(currentValue) === index)
    .map(clusterNode => {
      return {
        ...clusterNode,
        query: clusterNode.resourceType,
        onActivate: () => {
          const pathname = `/cluster/${encodeURIComponent(
            activeClusterName ?? '',
          )}/${clusterNode.pathSegment}`;
          navigate(pathname);
        },
        aliases:
          clusterNode.aliases ??
          getShortAliases(
            clusterNode.resourceType,
            resourceTypes,
            clusterNodes,
          ),
      };
    });
}

function createSingleResult(
  context: CommandPaletteContext,
  resourceType: string,
  matchedNode: NavNode,
): Result {
  const { clusterNodes, activeClusterName, navigate, t } = context;

  const resourceTypeText = t([
    `${resourceType}.title`,
    `command-palette.resource-names.${resourceType}`,
  ]);

  const linkToList = {
    label: resourceTypeText,
    category: matchedNode.category
      ? matchedNode.category + ' > ' + resourceTypeText
      : resourceTypeText,
    query: matchedNode.resourceType,
    onActivate: () => {
      const pathname = `/cluster/${encodeURIComponent(
        activeClusterName ?? '',
      )}/${matchedNode.pathSegment}`;
      navigate(pathname);
    },
    aliases:
      matchedNode.aliases ??
      getShortAliases(resourceType, resourceTypes, clusterNodes),
  };

  return linkToList;
}

function createResults(context: CommandPaletteContext): Result[] {
  const {
    tokens,
    clusterNodes,
    t,
    resourceCache,
    showHiddenNamespaces,
    hiddenNamespaces,
    activeClusterName,
    navigate,
  } = context;
  const [type, delimiter, name] = tokens;

  //return all when no query
  if (!type) {
    return createAllResults(context);
  }

  if (!delimiter) {
    const resourceTypeList = toFullResourceTypeList(type, resourceTypes);

    const results = resourceTypeList
      .map(resourceType => {
        const matchedNode = findNavigationNode(resourceType, clusterNodes);

        return matchedNode
          ? createSingleResult(context, resourceType, matchedNode)
          : null;
      })
      .filter(r => r !== null) as Result[];

    return results ?? [];
  }

  const resourceType = toFullResourceType(type, resourceTypes);
  const matchedNode = findNavigationNode(resourceType, clusterNodes);

  if (!matchedNode) {
    return [];
  }

  const resourceTypeText = t([
    `${resourceType}.title`,
    `command-palette.resource-names.${resourceType}`,
  ]);
  const linkToList = createSingleResult(context, resourceType, matchedNode);

  if (resourceType === 'namespaces' && ['-a', '*', 'all'].includes(name)) {
    if (window.location.pathname.includes('namespaces')) {
      return [
        {
          label: t('navigation.all-namespaces'),
          category: resourceTypeText,
          query: matchedNode.resourceType,
          onActivate: () =>
            sendNamespaceSwitchMessage('-all-', activeClusterName!, navigate),
          customActionText: t('command-palette.item-actions.switch'),
        },
        {
          label: t('navigation.all-namespaces'),
          category: resourceTypeText,
          query: matchedNode.resourceType,
          onActivate: () => {
            const pathname = `/cluster/${encodeURIComponent(
              activeClusterName ?? '',
            )}/namespaces/-all-`;
            navigate(pathname);
          },
        },
      ];
    } else {
      return [
        {
          label: t('navigation.all-namespaces'),
          category: resourceTypeText,
          query: matchedNode.resourceType,
          onActivate: () => {
            const pathname = `/cluster/${encodeURIComponent(
              activeClusterName ?? '',
            )}/namespaces/-all-`;
            navigate(pathname);
          },
        },
      ];
    }
  }

  let resources = resourceCache[resourceType];

  if (typeof resources !== 'object') {
    //@ts-ignore  TODO: handle typein Result
    return [linkToList, { type: LOADING_INDICATOR }];
  }
  if (resourceType === 'namespaces' && !showHiddenNamespaces) {
    resources = resources.filter(
      ns => !hiddenNamespaces.includes(ns.metadata.name),
    );
  }

  const pathElements = window.location.pathname
    .split('/')
    .filter(e => e !== '');
  const namespacesOverviewCase =
    window.location.pathname.includes('namespaces') &&
    pathElements.indexOf('namespaces') + 2 <= pathElements.length - 1;

  if (name) {
    const matchedResources = resources.filter(item =>
      item.metadata.name.includes(name),
    );
    // special case for a single namespace
    if (
      resourceType === 'namespaces' &&
      matchedResources.length === 1 &&
      namespacesOverviewCase
    ) {
      return makeSingleNamespaceLinks(matchedResources[0], context);
    }
    return matchedResources?.map(item =>
      makeListItem(item, matchedNode, context, true),
    );
  } else if (delimiter) {
    //special case for namespace overview
    if (resourceType === 'namespaces' && namespacesOverviewCase) {
      return [
        ...resources?.map(item =>
          makeListItem(item, matchedNode, context, false),
        ),
      ];
    }
    return [
      ...resources?.map(item => makeListItem(item, matchedNode, context, true)),
    ];
  } else {
    return [linkToList];
  }
}

export const clusterResourceHandler: Handler = {
  getAutocompleteEntries,
  getSuggestion,
  fetchResources: fetchClusterResources,
  createResults,
  getNavigationHelp: ({ clusterNodes }: CommandPaletteContext) =>
    resourceTypes
      .filter(rT => findNavigationNode(rT.resourceType, clusterNodes))
      .map(rT => ({ name: rT.resourceType, aliases: extractShortNames(rT) })),
};
