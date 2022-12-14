import { NavNode } from 'state/types';
import {
  makeSuggestion,
  toFullResourceType,
  autocompleteForResources,
  extractShortNames,
  findNavigationNode,
  getApiPathForQuery,
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
import { matchPath, NavigateFunction } from 'react-router-dom';

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
  const [type, name] = tokens;
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
    query: `${resourceType} ${name}`,
    // some resources have no category
    category: category ? category + ' > ' + resourceTypeText : resourceTypeText,
    onActivate: () => {
      const pathname = `/cluster/${activeClusterName}/${pathSegment}/${name}`;
      navigate(pathname);
    },
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
  navigate: NavigateFunction,
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
    `/cluster/${activeClusterName}/namespaces/${newNamespace}/${resourceType}`,
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
  const query = `namespaces ${name}`;

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
      const pathname = `/cluster/${activeClusterName}/namespaces/${name}`;
      navigate(pathname);
    },
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
  const [type, name] = tokens;
  const resourceType = toFullResourceType(type, resourceTypes);
  const matchedNode = findNavigationNode(resourceType, clusterNodes);
  if (!matchedNode) {
    return [];
  }

  const resourceTypeText = t([
    `${resourceType}.title`,
    `command-palette.resource-names.${resourceType}`,
  ]);

  const linkToList = {
    label: t('command-palette.results.list-of', {
      resourceType: resourceTypeText,
    }),
    category: matchedNode.category
      ? matchedNode.category + ' > ' + resourceTypeText
      : resourceTypeText,
    query: matchedNode.resourceType,
    onActivate: () => {
      const pathname = `/cluster/${activeClusterName}/${matchedNode.pathSegment}`;
      navigate(pathname);
    },
  };

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

  if (name) {
    const matchedResources = resources.filter(item =>
      item.metadata.name.includes(name),
    );
    // special case for a single namespace
    if (resourceType === 'namespaces' && matchedResources.length === 1) {
      return makeSingleNamespaceLinks(matchedResources[0], context);
    }
    return matchedResources?.map(item =>
      makeListItem(item, matchedNode, context),
    );
  } else {
    return [
      linkToList,
      ...resources?.map(item => makeListItem(item, matchedNode, context)),
    ];
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
