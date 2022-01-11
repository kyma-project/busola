import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import { LOADING_INDICATOR } from '../useSearchResults';
import {
  getSuggestion,
  getApiPath,
  toFullResourceType,
  formatTypeSingular,
  formatTypePlural,
} from './helpers';

const clusterResourceTypes = [
  ['clusterrolebindings', 'crb', 'crbs'],
  ['clusterroles'],
  ['applications', 'app', 'apps'],
  ['clusteraddonsconfigurations', 'clusteraddon', 'clusteraddons'],
  ['namespaces', 'ns'],
].map(aliases => [...aliases, pluralize(aliases[0], 1)]);

function getAutocompleteEntries({ tokens, resourceCache }) {
  const type = tokens[0];
  const tokenToAutocomplete = tokens[tokens.length - 1];
  switch (tokens.length) {
    case 1: // type
      // take only first, plural form
      const resourceTypes = clusterResourceTypes.flatMap(t => t[0]);
      return resourceTypes.filter(rN => rN.startsWith(type));
    case 2: // name
      const fullResourceType = toFullResourceType(type, clusterResourceTypes);
      const resourceNames = (resourceCache[fullResourceType] || []).map(
        n => n.metadata.name,
      );
      return resourceNames
        .filter(name => name.startsWith(tokenToAutocomplete))
        .map(name => `${type} ${name} `);
    default:
      return [];
  }
}

function getSuggestions({ tokens, resourceCache }) {
  const [type, name] = tokens;
  const suggestedType = getSuggestion(
    type,
    clusterResourceTypes.flatMap(n => n),
  );
  if (name) {
    const fullResourceType = toFullResourceType(type, clusterResourceTypes);
    const resourceNames = (resourceCache[fullResourceType] || []).map(
      n => n.metadata.name,
    );
    const suggestedName = getSuggestion(name, resourceNames);
    return `${suggestedType} ${suggestedName}`;
  } else {
    return suggestedType;
  }
}

function makeListItem(item, matchedNode) {
  const detailsLink =
    matchedNode.resourceType === 'namespaces'
      ? `/${item.metadata.name}/details`
      : `/details/${item.metadata.name}`;
  const link = matchedNode.pathSegment + detailsLink;

  return {
    label: `${formatTypeSingular(matchedNode.viewUrl)} ${item.metadata.name}`,
    query: `${matchedNode.resourceType} ${item.metadata.name}`,
    category: matchedNode.category,
    onActivate: () =>
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate(link),
  };
}

function getApiPathForQuery({ tokens, clusterNodes }) {
  const resourceType = toFullResourceType(tokens[0], clusterResourceTypes);
  return getApiPath(resourceType, clusterNodes);
}
async function fetchClusterResources(context) {
  const apiPath = getApiPathForQuery(context);
  if (!apiPath) {
    return;
  }

  const { fetch, tokens, updateResourceCache } = context;
  const resourceType = toFullResourceType(tokens[0], clusterResourceTypes);
  try {
    const response = await fetch(apiPath + '/' + resourceType);
    const { items } = await response.json();
    updateResourceCache(resourceType, items);
  } catch (e) {
    console.warn(e);
  }
}

function createResults({
  tokens,
  resourceCache,
  showHiddenNamespaces,
  hiddenNamespaces,
  clusterNodes,
}) {
  const [type, name] = tokens;

  const resourceType = toFullResourceType(type, clusterResourceTypes);
  const matchedNode = clusterNodes.find(n => n.resourceType === resourceType);

  if (!matchedNode) {
    return;
  }

  const linkToList = {
    label: `List of ${formatTypePlural(matchedNode.viewUrl)}`,
    category: matchedNode?.category,
    query: matchedNode?.resourceType,
    onActivate: () =>
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate(matchedNode.pathSegment),
  };

  let resources = resourceCache[resourceType];
  if (typeof resources !== 'object') {
    return [linkToList, LOADING_INDICATOR];
  }
  if (resourceType === 'namespaces' && !showHiddenNamespaces) {
    resources = resources.filter(
      ns => !hiddenNamespaces.includes(ns.metadata.name),
    );
  }

  if (name) {
    return resources
      .filter(item => item.metadata.name.includes(name))
      .map(item => makeListItem(item, matchedNode));
  } else {
    return [
      linkToList,
      ...resources.map(item => makeListItem(item, matchedNode)),
    ];
  }
}

export const clusterResourceHandler = {
  getAutocompleteEntries,
  getSuggestions,
  fetchResources: fetchClusterResources,
  createResults,
};
