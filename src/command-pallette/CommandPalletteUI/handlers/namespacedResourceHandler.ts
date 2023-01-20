import {
  makeSuggestion,
  toFullResourceType,
  autocompleteForResources,
  extractShortNames,
  findNavigationNode,
  getApiPathForQuery,
} from './helpers';
import { namespaceNativeResourceTypes as resourceTypes } from 'shared/constants';
import {
  CommandPaletteContext,
  Handler,
  LOADING_INDICATOR,
  Result,
} from '../types';
import { K8sResource } from 'types';
import { NavNode } from 'state/types';

function getAutocompleteEntries({
  tokens,
  namespace,
  resourceCache,
}: CommandPaletteContext) {
  const fullResourceType = toFullResourceType(tokens[0], resourceTypes);
  const resources = resourceCache[`${namespace}/${fullResourceType}`] || [];

  return autocompleteForResources({
    tokens,
    resources,
    resourceTypes,
  });
}

function getSuggestion({
  tokens,
  namespace,
  resourceCache,
}: CommandPaletteContext) {
  const [type, name] = tokens;
  const suggestedType = makeSuggestion(
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
  const { activeClusterName, navigate, t } = context;
  const name = item.metadata.name;

  const namespacePart = `namespaces/${item.metadata.namespace}`;
  const link = `${namespacePart}/${matchedNode.pathSegment}/${name}`;

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
    onActivate: () => {
      const pathname = `/cluster/${activeClusterName}/${link}`;
      navigate(pathname);
    },
  };
}

async function fetchNamespacedResource(context: CommandPaletteContext) {
  const {
    fetch,
    namespace,
    tokens,
    namespaceNodes,
    updateResourceCache,
  } = context;
  const apiPath = getApiPathForQuery(tokens, namespaceNodes, resourceTypes);
  if (!apiPath) {
    return;
  }
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

function createResults(context: CommandPaletteContext): Result[] | null {
  const {
    tokens,
    namespace,
    resourceCache,
    namespaceNodes,
    activeClusterName,
    navigate,
    t,
  } = context;

  const [type, name] = tokens;
  const resourceType = toFullResourceType(type, resourceTypes);
  const matchedNode = findNavigationNode(resourceType, namespaceNodes);
  if (!matchedNode) {
    return null;
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
    onActivate: () => {
      const pathname = `/cluster/${activeClusterName}/namespaces/${namespace}/${matchedNode.pathSegment}`;
      navigate(pathname);
    },
  };

  const resources = resourceCache[`${namespace}/${resourceType}`];
  if (typeof resources !== 'object') {
    return [
      linkToList,
      { type: LOADING_INDICATOR, label: '', onActivate: () => {}, query: '' },
    ];
  }

  if (name) {
    return resources
      .filter(item => item.metadata.name.includes(name))
      .map(item => makeListItem(item, matchedNode, context));
  } else {
    return [
      linkToList,
      ...resources.map(item => makeListItem(item, matchedNode, context)),
    ];
  }
}

export const namespacedResourceHandler: Handler = {
  getAutocompleteEntries,
  getSuggestion,
  fetchResources: fetchNamespacedResource,
  createResults,
  getNavigationHelp: ({ namespaceNodes }: CommandPaletteContext) =>
    resourceTypes
      .filter(rT => findNavigationNode(rT.resourceType, namespaceNodes))
      .map(rT => ({ name: rT.resourceType, aliases: extractShortNames(rT) })),
};
