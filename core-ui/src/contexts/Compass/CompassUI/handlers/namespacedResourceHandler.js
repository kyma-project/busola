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

const namespacedResourceNames = [
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

function getSuggestions({ tokens, namespace, resourceCache }) {
  const [type, name] = tokens;
  const suggestedType = getSuggestion(
    type,
    namespacedResourceNames.flatMap(n => n),
  );
  if (name) {
    const fullResourceType = toFullResourceType(type, namespacedResourceNames);
    const resourceNames = (
      resourceCache[`${namespace}/${fullResourceType}`] || []
    ).map(n => n.metadata.name);
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
  const namespacePart = `namespaces/${item.metadata.namespace}`;
  const detailsPart = `details/${item.metadata.name}`;
  const link = `${namespacePart}/${matchedNode.pathSegment}/${detailsPart}`;

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

function getApiPathForQuery({ tokens, namespaceNodes }) {
  const resourceType = toFullResourceType(tokens[0], namespacedResourceNames);
  return getApiPath(resourceType, namespaceNodes);
}

async function fetchNamespacedResource(context) {
  const apiPath = getApiPathForQuery(context);
  if (!apiPath) {
    return;
  }

  const { fetch, namespace, tokens, updateResourceCache } = context;
  const resourceType = toFullResourceType(tokens[0], namespacedResourceNames);
  try {
    const path = `${apiPath}/namespaces/${namespace}/${resourceType}`;
    const response = await fetch(path);
    const { items } = await response.json();
    updateResourceCache(`${namespace}/${resourceType}`, items);
  } catch (e) {
    console.log(e);
  }
}

function createResults({ tokens, namespace, resourceCache, namespaceNodes }) {
  const [type, name] = tokens;

  const resourceType = toFullResourceType(type, namespacedResourceNames);
  const matchedNode = namespaceNodes.find(n => n.resourceType === resourceType);

  if (!matchedNode) {
    return;
  }

  const linkToList = {
    label: `List of ${formatTypePlural(matchedNode.viewUrl)}`,
    category: matchedNode.category,
    query: matchedNode.resourceType,
    onActivate: () =>
      LuigiClient.linkManager()
        .fromContext('cluster')
        .navigate(`namespaces/${namespace}/${matchedNode.pathSegment}`),
  };

  const resources = resourceCache[`${namespace}/${resourceType}`];
  if (typeof resources !== 'object') {
    return [linkToList, LOADING_INDICATOR];
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

export const namespacedResourceHandler = {
  getAutocompleteEntries,
  getSuggestions,
  fetchResources: fetchNamespacedResource,
  createResults,
};
