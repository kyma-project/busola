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

const clusterResourceNames = [
  ['clusterrolebindings', 'crb', 'crbs'],
  ['clusterroles'],
  ['applications', 'app', 'apps'],
  ['clusteraddonsconfigurations', 'clusteraddon', 'clusteraddons'],
  ['namespaces', 'ns'],
  ['customresourcedefinitions', 'crd', 'crds'],
].map(aliases => [...aliases, pluralize(aliases[0], 1)]);

function getAutocompleteEntries({ tokens, resourceCache }) {
  // const l = tokens.length;
  // const tokenToAutocomplete = tokens[l - 1];
  // switch (l) {
  //   case 1: // type
  //     if ('node'.startsWith(tokenToAutocomplete)) {
  //       return 'node';
  //     }
  //     break;
  //   case 2: //name
  //     const nodeNames = (resourceCache['nodes'] || []).map(
  //       n => n.metadata.name,
  //     );
  //     return nodeNames.filter(name => name.startsWith(tokenToAutocomplete));
  //   default:
  //     return [];
  // }
  return [];
}

function getSuggestions({ tokens, resourceCache }) {
  const [type, name] = tokens;
  const suggestedType = getSuggestion(
    type,
    clusterResourceNames.flatMap(n => n),
  );
  if (name) {
    const fullResourceType = toFullResourceType(type, clusterResourceNames);
    const resourceNames = (resourceCache[fullResourceType] || []).map(
      n => n.metadata.name,
    );
    const suggestedName = getSuggestion(name, resourceNames) || name;
    const suggestion = `${suggestedType || type} ${suggestedName}`;
    if (suggestion !== `${type} ${name}`) {
      return suggestion;
    }
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
  const resourceType = toFullResourceType(tokens[0], clusterResourceNames);
  return getApiPath(resourceType, clusterNodes);
}
async function fetchClusterResources(context) {
  const apiPath = getApiPathForQuery(context);
  if (!apiPath) {
    return;
  }

  const { fetch, tokens, updateResourceCache } = context;
  const resourceType = toFullResourceType(tokens[0], clusterResourceNames);
  try {
    const response = await fetch(apiPath + '/' + resourceType);
    const { items } = await response.json();
    updateResourceCache(resourceType, items);
  } catch (e) {
    console.log(e);
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

  const resourceType = toFullResourceType(type, clusterResourceNames);
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
