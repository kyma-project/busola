import { NavNode } from 'state/types';
import { TFunction } from 'react-i18next';
import LuigiClient from '@luigi-project/client';
import { getApiPath } from 'shared/utils/helpers';
import {
  getSuggestion,
  toFullResourceType,
  autocompleteForResources,
  extractShortNames,
  findNavigationNode,
} from './helpers';
import { clusterNativeResourceTypes as resourceTypes } from 'shared/constants';
import {
  CommandPaletteContext,
  Handler,
  LOADING_INDICATOR,
  Result,
} from '../types';
import { K8sResource } from 'types';

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

function getSuggestions({ tokens, resourceCache }: CommandPaletteContext) {
  const [type, name] = tokens;
  const suggestedType = getSuggestion(
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
    const suggestedName = getSuggestion(name, resourceNames);
    return `${suggestedType || type} ${suggestedName || name}`;
  } else {
    return suggestedType;
  }
}

function makeListItem(
  item: K8sResource,
  matchedNode: NavNode,
  t: TFunction<'translations', undefined>,
) {
  const name = item.metadata.name;
  const { pathSegment, resourceType, category } = matchedNode;

  const detailsLink =
    resourceType === 'namespaces' ? `/${name}/details` : `/details/${name}`;
  const link = pathSegment + detailsLink;

  const resourceTypeText = t([
    `${resourceType}.title`,
    `command-palette.resource-names.${resourceType}`,
  ]);

  return {
    label: name,
    query: `${resourceType} ${name}`,
    // some resources have no category
    category: category ? category + ' > ' + resourceTypeText : resourceTypeText,
    onActivate: () =>
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate(link),
  };
}

function getApiPathForQuery({ tokens, clusterNodes }: CommandPaletteContext) {
  const resourceType = toFullResourceType(tokens[0], resourceTypes);
  return getApiPath(resourceType, clusterNodes);
}

async function fetchClusterResources(context: CommandPaletteContext) {
  const apiPath = getApiPathForQuery(context);
  if (!apiPath) {
    return;
  }
  const { fetch, tokens, updateResourceCache, clusterNodes } = context;

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

function sendNamespaceSwitchMessage(namespaceName: string) {
  LuigiClient.sendCustomMessage({
    id: 'busola.switchNamespace',
    namespaceName,
  });
}

function makeSingleNamespaceLinks(
  namespace: K8sResource,
  t: TFunction<'translations', undefined>,
) {
  const category = t('namespaces.title');
  const label = namespace.metadata.name;
  const name = namespace.metadata.name;
  const query = `namespaces ${name}`;

  const switchContextNode = {
    label,
    category,
    query,
    onActivate: () => sendNamespaceSwitchMessage(name),
    customActionText: t('command-palette.item-actions.switch'),
  };

  const navigateToDetailsNode = {
    label,
    category,
    query,
    onActivate: () =>
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate('namespaces/' + name),
  };

  return [switchContextNode, navigateToDetailsNode];
}

function createResults({
  tokens,
  resourceCache,
  showHiddenNamespaces,
  hiddenNamespaces,
  clusterNodes,
  t,
}: CommandPaletteContext): Result[] {
  const [type, name] = tokens;
  const resourceType = toFullResourceType(type, resourceTypes);
  const matchedNode: NavNode = findNavigationNode(resourceType, clusterNodes);
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
    onActivate: () =>
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate(matchedNode.pathSegment),
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
      return makeSingleNamespaceLinks(matchedResources[0], t);
    }
    return matchedResources?.map(item => makeListItem(item, matchedNode, t));
  } else {
    return [
      linkToList,
      ...resources?.map(item => makeListItem(item, matchedNode, t)),
    ];
  }
}

export const clusterResourceHandler: Handler = {
  getAutocompleteEntries,
  getSuggestions,
  fetchResources: fetchClusterResources,
  createResults,
  //@ts-ignore
  getNavigationHelp: ({ clusterNodes }: CommandPaletteContext) =>
    resourceTypes
      .filter(rT => findNavigationNode(rT.resourceType, clusterNodes))
      .map(rT => [{ name: rT.resourceType, aliases: extractShortNames(rT) }]),
};
