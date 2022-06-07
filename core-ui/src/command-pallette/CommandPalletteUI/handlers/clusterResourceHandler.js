import LuigiClient from '@luigi-project/client';
import { LOADING_INDICATOR } from '../useSearchResults';
import { getApiPath } from 'shared/utils/helpers';
import {
  getSuggestion,
  toFullResourceType,
  autocompleteForResources,
  extractShortNames,
  findNavigationNode,
} from './helpers';
import { clusterNativeResourceTypes as resourceTypes } from 'shared/constants';

function getAutocompleteEntries({ tokens, resourceCache }) {
  const fullResourceType = toFullResourceType(tokens[0], resourceTypes);
  const resources = resourceCache[fullResourceType] || [];

  return autocompleteForResources({
    tokens,
    resources,
    resourceTypes,
  });
}

function getSuggestions({ tokens, resourceCache }) {
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

function makeListItem(item, matchedNode, t) {
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

function getApiPathForQuery({ tokens, clusterNodes }) {
  const resourceType = toFullResourceType(tokens[0], resourceTypes);
  return getApiPath(resourceType, clusterNodes);
}

async function fetchClusterResources(context) {
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

function sendNamespaceSwitchMessage(namespaceName) {
  LuigiClient.sendCustomMessage({
    id: 'busola.switchNamespace',
    namespaceName,
  });
}

function makeSingleNamespaceLinks({ namespace, t }) {
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
}) {
  const [type, name] = tokens;
  const resourceType = toFullResourceType(type, resourceTypes);
  const matchedNode = findNavigationNode(resourceType, clusterNodes);
  if (!matchedNode) {
    return;
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
      return makeSingleNamespaceLinks({ namespace: matchedResources[0], t });
    }
    return matchedResources?.map(item => makeListItem(item, matchedNode, t));
  } else {
    return [
      linkToList,
      ...resources?.map(item => makeListItem(item, matchedNode, t)),
    ];
  }
}

export const clusterResourceHandler = {
  getAutocompleteEntries,
  getSuggestions,
  fetchResources: fetchClusterResources,
  createResults,
  getNavigationHelp: ({ clusterNodes }) =>
    resourceTypes
      .filter(rT => findNavigationNode(rT.resourceType, clusterNodes))
      .map(rT => [rT.resourceType, extractShortNames(rT)]),
};
