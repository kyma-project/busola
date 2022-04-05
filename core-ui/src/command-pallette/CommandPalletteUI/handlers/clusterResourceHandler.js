import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import { LOADING_INDICATOR } from '../useSearchResults';
import { getApiPath } from 'shared/utils/helpers';
import {
  getSuggestion,
  toFullResourceType,
  autocompleteForResources,
} from './helpers';

const resourceTypes = [
  ['clusterrolebindings', 'crbs', 'crb'],
  ['clusterroles', 'cr'],
  ['storageclasses'],
  ['persistentvolumes', 'pv'],
  ['namespaces', 'ns'],
];
const extendedResourceTypes = resourceTypes.map(aliases => [
  ...aliases,
  pluralize(aliases[0], 1),
]);

function getAutocompleteEntries({ tokens, resourceCache }) {
  const fullResourceType = toFullResourceType(tokens[0], extendedResourceTypes);
  const resources = resourceCache[fullResourceType] || [];

  return autocompleteForResources({
    tokens,
    resources,
    resourceTypes: extendedResourceTypes,
  });
}

function getSuggestions({ tokens, resourceCache }) {
  const [type, name] = tokens;
  const suggestedType = getSuggestion(
    type,
    extendedResourceTypes.flatMap(n => n),
  );
  if (name) {
    const fullResourceType = toFullResourceType(
      suggestedType || type,
      extendedResourceTypes,
    );
    const resourceNames = (resourceCache[fullResourceType] || []).map(
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
  const resourceType = toFullResourceType(tokens[0], extendedResourceTypes);
  return getApiPath(resourceType, clusterNodes);
}
async function fetchClusterResources(context) {
  const apiPath = getApiPathForQuery(context);
  if (!apiPath) {
    return;
  }

  const { fetch, tokens, updateResourceCache } = context;
  const resourceType = toFullResourceType(tokens[0], extendedResourceTypes);
  if (!extendedResourceTypes.flatMap(t => t).includes(resourceType)) {
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

function createResults({
  tokens,
  resourceCache,
  showHiddenNamespaces,
  hiddenNamespaces,
  clusterNodes,
  t,
}) {
  const [type, name] = tokens;

  const resourceType = toFullResourceType(type, extendedResourceTypes);
  if (!extendedResourceTypes.flat().includes(resourceType)) {
    return;
  }
  const matchedNode = clusterNodes.find(n => n.resourceType === resourceType);

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
  getNavigationHelp: () =>
    resourceTypes.map(types => {
      if (types.length === 1) {
        return [types[0]];
      } else {
        return [types[0], types[types.length - 1]];
      }
    }),
};
