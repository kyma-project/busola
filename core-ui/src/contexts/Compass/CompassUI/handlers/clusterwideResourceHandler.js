import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import {
  getSuggestion,
  getApiPath,
  toFullResourceType,
  formatTypeSingular,
  formatTypePlural,
} from './helpers';

const clusterwideResources = [
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
    category: matchedNode.category,
    onClick: () =>
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate(link),
  };
}

async function fetchResults({ fetch, tokens, clusterNodes }) {
  const [type, name] = tokens;
  const resourceType = toFullResourceType(type, clusterwideResources);

  const matchedNode = clusterNodes.find(n => n.resourceType === resourceType);
  const resourceApiPath = getApiPath(matchedNode?.viewUrl);

  if (resourceApiPath) {
    try {
      const linkToList = {
        label: `List of ${formatTypePlural(matchedNode.viewUrl)}`,
        category: matchedNode?.category,
        onClick: () =>
          LuigiClient.linkManager()
            .fromContext('cluster')
            .navigate(matchedNode.pathSegment),
      };

      const response = await fetch(resourceApiPath + '/' + resourceType);
      const { items } = await response.json();

      if (name) {
        const matchedByName = items.filter(item =>
          item.metadata.name.includes(name),
        );
        return [
          linkToList,
          ...matchedByName.map(item => makeListItem(item, matchedNode)),
        ];
      } else {
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
      clusterwideResources.flatMap(r => r),
    ),
  };
}
