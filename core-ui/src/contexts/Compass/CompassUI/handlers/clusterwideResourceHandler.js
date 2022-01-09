import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import {
  getSuggestion,
  getApiPath,
  toFullResourceType,
  formatTypeSingular,
  formatTypePlural,
} from './helpers';

const clusterwideResourceNames = [
  ['clusterrolebindings', 'crb', 'crbs'],
  ['clusterroles'],
  ['applications', 'app', 'apps'],
  ['clusteraddonsconfigurations', 'clusteraddon', 'clusteraddons'],
  ['namespaces', 'ns'],
  ['customresourcedefinitions', 'crd', 'crds'],
].map(aliases => [...aliases, pluralize(aliases[0], 1)]);

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

async function fetchResults({
  fetch,
  tokens,
  clusterNodes,
  hiddenNamespaces,
  showHiddenNamespaces,
}) {
  const [type, name] = tokens;
  const resourceType = toFullResourceType(type, clusterwideResourceNames);

  const matchedNode = clusterNodes.find(n => n.resourceType === resourceType);
  const resourceApiPath = getApiPath(matchedNode?.viewUrl);

  if (resourceApiPath) {
    try {
      const response = await fetch(resourceApiPath + '/' + resourceType);
      let { items } = await response.json();

      if (resourceType === 'namespaces' && !showHiddenNamespaces) {
        items = items.filter(
          ns => !hiddenNamespaces.includes(ns.metadata.name),
        );
      }

      if (name) {
        return items
          .filter(item => item.metadata.name.includes(name))
          .map(item => makeListItem(item, matchedNode));
      } else {
        const linkToList = {
          label: `List of ${formatTypePlural(matchedNode.viewUrl)}`,
          category: matchedNode?.category,
          query: matchedNode?.resourceType,
          onActivate: () =>
            LuigiClient.linkManager()
              .fromContext('cluster')
              .navigate(matchedNode.pathSegment),
        };

        return [
          linkToList,
          ...items.map(item => makeListItem(item, matchedNode)),
        ];
      }
    } catch (e) {
      console.warn(e);
    }
  }
  return null;
}

export async function clusterwideResourceHandler(context) {
  const searchResults = await fetchResults(context);
  return {
    searchResults,
    suggestion: getSuggestion(
      context.tokens[0],
      clusterwideResourceNames.flatMap(r => r),
    ),
  };
}
