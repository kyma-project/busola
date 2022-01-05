import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import {
  getSuggestion,
  getApiPath,
  toFullResourceType,
  formatTypeSingular,
  formatTypePlural,
} from './helpers';

const namespacedResources = [
  ['configmaps', 'cm'],
  ['pods', 'po'],
  ['secrets'],
  ['serviceaccounts', 'sa'],
  ['services', 'svc'],
  ['addonsconfigurations', 'addons'],
  ['customresourcedefinitions', 'crd', 'crds'],
  ['daemonsets', 'ds'],
  ['deployments', 'deploy'],
  ['replicasets', 'rs'],
  ['statefulsets', 'sts'],
  ['cronjobs', 'cj'],
  ['jobs'],
  ['certificates', 'cert', 'certs'],
  ['issuers'],
  ['dnsentries', 'dnse'],
  ['dnsproviders', 'dnspr'],
  ['subscriptions'],
  ['ingresses', 'ing'],
  ['apirules'],
  ['oauth2clients'],
  ['destinationrules', 'dr'],
  ['gateways', 'gw'],
  ['virtualservices', 'vs'],
  ['rolebindings', 'rb', 'rbs'],
  ['roles'],
  ['functions', 'fn'],
  ['gitrepositories', 'repos', 'gitrepos'],
].map(aliases => [...aliases, pluralize(aliases[0], 1)]);

function makeListItem(item, matchedNode) {
  const namespacePart = `namespaces/${item.metadata.namespace}`;
  const detailsPart = `details/${item.metadata.name}`;
  const link = `${namespacePart}/${matchedNode.pathSegment}/${detailsPart}`;

  return {
    label: `${formatTypeSingular(matchedNode.viewUrl)} ${item.metadata.name}`,
    query: `${matchedNode.resourceType} ${item.metadata.name}`,
    category: matchedNode.category,
    onClick: () =>
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate(link),
  };
}

async function fetchResults({
  fetch,
  namespace = 'default',
  tokens,
  namespaceNodes,
}) {
  const [type, name] = tokens;
  const resourceType = toFullResourceType(type, namespacedResources);

  const matchedNode = namespaceNodes.find(n => n.resourceType === resourceType);
  const resourceApiPath = getApiPath(matchedNode?.viewUrl);

  if (resourceApiPath) {
    try {
      const response = await fetch(resourceApiPath + '/' + resourceType);
      const items = (await response.json()).items.filter(
        item => item.metadata.namespace === namespace,
      );
      if (name) {
        return items
          .filter(item => item.metadata.name.includes(name))
          .map(item => makeListItem(item, matchedNode));
      } else {
        const linkToList = {
          label: `List of ${formatTypePlural(matchedNode.viewUrl)}`,
          category: matchedNode.category,
          query: matchedNode.resourceType,
          onClick: () =>
            LuigiClient.linkManager()
              .fromContext('cluster')
              .navigate(`namespaces/${namespace}/${matchedNode.pathSegment}`),
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

export async function namespacedResourceHandler(context) {
  const searchResults = await fetchResults(context);
  return {
    searchResults,
    suggestion: getSuggestion(
      context.tokens[0],
      namespacedResources.flatMap(r => r),
    ),
  };
}
