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
import { namespaceNativeResourceTypes as resourceTypes } from 'shared/constants';

function getAutocompleteEntries({ tokens, namespace, resourceCache }) {
  const fullResourceType = toFullResourceType(tokens[0], resourceTypes);
  const resources = resourceCache[`${namespace}/${fullResourceType}`] || [];

  return autocompleteForResources({
    tokens,
    resources,
    resourceTypes,
  });
}

function getSuggestions({ tokens, namespace, resourceCache }) {
  const [type, name] = tokens;
  const suggestedType = getSuggestion(
    type,
    resourceTypes.flatMap(n => n.aliases),
  );
  if (name) {
    const resourceType = toFullResourceType(
      suggestedType || type,
      resourceTypes,
    );
    const resourceNames = (
      resourceCache[`${namespace}/${resourceType}`] || []
    ).map(n => n.metadata.name);
    const suggestedName = getSuggestion(name, resourceNames);
    return `${suggestedType || type} ${suggestedName || name}`;
  } else {
    return suggestedType;
  }
}

function makeListItem(item, matchedNode, t) {
  const name = item.metadata.name;

  const namespacePart = `namespaces/${item.metadata.namespace}`;
  const detailsPart = `details/${name}`;
  const link = `${namespacePart}/${matchedNode.pathSegment}/${detailsPart}`;

  return {
    label: name,
    query: `${matchedNode.resourceType} ${name}`,
    category:
      matchedNode.category +
      ' > ' +
      t([
        `${matchedNode.resourceType}.title`,
        `command-palette.resource-names.${matchedNode.resourceType}`,
      ]),
    onActivate: () =>
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate(link),
  };
}

function getApiPathForQuery({ tokens, namespaceNodes }) {
  const resourceType = toFullResourceType(tokens[0], resourceTypes);
  return getApiPath(resourceType, namespaceNodes);
}

async function fetchNamespacedResource(context) {
  const apiPath = getApiPathForQuery(context);
  if (!apiPath) {
    return;
  }
  const {
    fetch,
    namespace,
    tokens,
    namespaceNodes,
    updateResourceCache,
  } = context;
  const resourceType = toFullResourceType(tokens[0], resourceTypes);
  const matchedNode = findNavigationNode(resourceType, namespaceNodes);

  if (!matchedNode) {
    return;
  }

  try {
    const path = `${apiPath}/namespaces/${namespace}/${resourceType}`;
    const response = await fetch(path);
    const { items } = await response.json();
    updateResourceCache(`${namespace}/${resourceType}`, items);
  } catch (e) {
    console.warn(e);
  }
}

function createResults({
  tokens,
  namespace,
  resourceCache,
  namespaceNodes,
  t,
}) {
  const [type, name] = tokens;
  const resourceType = toFullResourceType(type, resourceTypes);
  const matchedNode = findNavigationNode(resourceType, namespaceNodes);
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
    category: matchedNode.category + ' > ' + resourceTypeText,
    query: matchedNode.resourceType,
    onActivate: () =>
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate(`namespaces/${namespace}/${matchedNode.pathSegment}`),
  };

  const resources = resourceCache[`${namespace}/${resourceType}`];
  if (typeof resources !== 'object') {
    return [linkToList, { type: LOADING_INDICATOR }];
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

export const namespacedResourceHandler = {
  getAutocompleteEntries,
  getSuggestions,
  fetchResources: fetchNamespacedResource,
  createResults,
  getNavigationHelp: ({ namespaceNodes }) =>
    resourceTypes
      .filter(rT => findNavigationNode(rT.resourceType, namespaceNodes))
      .map(rT => [rT.resourceType, extractShortNames(rT)]),
};
