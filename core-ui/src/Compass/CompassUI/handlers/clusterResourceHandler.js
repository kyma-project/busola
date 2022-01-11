import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import { LOADING_INDICATOR } from '../useSearchResults';
import {
  getSuggestion,
  getApiPath,
  toFullResourceType,
  autocompleteForResources,
} from './helpers';

const clusterResourceTypes = [
  ['clusterrolebindings', 'crb', 'crbs'],
  ['clusterroles', 'cr'],
  ['applications', 'app', 'apps'],
  ['clusteraddonsconfigurations', 'clusteraddon', 'clusteraddons'],
  ['namespaces', 'ns'],
].map(aliases => [...aliases, pluralize(aliases[0], 1)]);

function getAutocompleteEntries({ tokens, resourceCache }) {
  const fullResourceType = toFullResourceType(tokens[0], clusterResourceTypes);
  const resources = resourceCache[fullResourceType] || [];

  return autocompleteForResources({
    tokens,
    resources,
    resourceTypes: clusterResourceTypes,
  });
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
    if (suggestedType && suggestedName) {
      return `${suggestedType} ${suggestedName}`;
    }
  } else {
    return suggestedType;
  }
}

function makeListItem(item, matchedNode, t) {
  const detailsLink =
    matchedNode.resourceType === 'namespaces'
      ? `/${item.metadata.name}/details`
      : `/details/${item.metadata.name}`;
  const link = matchedNode.pathSegment + detailsLink;

  return {
    label: t('compass.results.resource-and-name', {
      resourceType: pluralize(
        t([
          `${matchedNode.resourceType}.title`,
          `compass.resource-names.${matchedNode.resourceType}`,
        ]),
        1,
      ),
      name: item.metadata.name,
    }),
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
  t,
}) {
  const [type, name] = tokens;

  const resourceType = toFullResourceType(type, clusterResourceTypes);
  const matchedNode = clusterNodes.find(n => n.resourceType === resourceType);

  if (!matchedNode) {
    return;
  }

  const linkToList = {
    label: t('compass.results.list-of', {
      resourceType: t([
        `${resourceType}.title`,
        `compass.resource-names.${resourceType}`,
      ]),
    }),
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
      .map(item => makeListItem(item, matchedNode, t));
  } else {
    return [
      linkToList,
      ...resources.map(item => makeListItem(item, matchedNode, t)),
    ];
  }
}

export const clusterResourceHandler = {
  getAutocompleteEntries,
  getSuggestions,
  fetchResources: fetchClusterResources,
  createResults,
};
