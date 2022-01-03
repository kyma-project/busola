import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import {
  getSuggestion,
  getApiPath,
  toFullName,
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
  const namespacePart = `namespaces/${item.metadata.namespace}/`;
  const detailsPart = `/details/${item.metadata.name}`;
  const link = `${namespacePart}/${matchedNode.pathSegment}/${detailsPart}`;

  return {
    label: `${formatTypeSingular(matchedNode.viewUrl)} ${item.metadata.name}`,
    category: matchedNode.category,
    onClick: () =>
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate(link),
  };
}

async function namespacedResourceHandler2({
  fetch,
  namespace = 'default',
  tokens,
  namespaceNodes,
}) {
  const resourceType = toFullName(tokens[0], namespacedResources);

  const matchedNode = namespaceNodes.find(n => n.resourceType === resourceType);
  const resourceApiPath = getApiPath(matchedNode?.viewUrl);

  if (resourceApiPath) {
    const linkToList = {
      label: `List of ${formatTypePlural(matchedNode.viewUrl)}`,
      category: matchedNode?.category,
      onClick: () =>
        LuigiClient.linkManager()
          .fromContext('cluster')
          .navigate(`namespaces/${namespace}/${matchedNode.pathSegment}`),
    };

    try {
      const response = await fetch(resourceApiPath + '/' + resourceType);
      const items = (await response.json()).items.filter(
        item => item.metadata.namespace === namespace,
      );
      if (tokens[1]) {
        const matchedByName = items.filter(item =>
          item.metadata.name.includes(tokens[1]),
        );
        if (matchedByName) {
          return [
            linkToList,
            ...matchedByName.map(item => makeListItem(item, matchedNode)),
          ];
        }
        //wtf naming
        return [linkToList];
      } else {
        return [
          linkToList,
          ...items.map(item => makeListItem(item, matchedNode)),
        ];
      }
    } catch (e) {
      console.log(e);
      console.log(matchedNode);
    }
  }
  return null;
}

export async function namespacedResourceHandler(context) {
  const searchResults = await namespacedResourceHandler2(context);
  return {
    searchResults,
    suggestion: getSuggestion(
      context.tokens[0],
      namespacedResources.flatMap(r => r),
    ),
  };
}
