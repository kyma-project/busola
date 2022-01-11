import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import { LOADING_INDICATOR } from '../useSearchResults';
import {
  getSuggestion,
  getApiPath,
  toFullResourceType,
  autocompleteForResources,
} from './helpers';

const namespacedResourceTypes = [
  ['configmaps', 'cm'],
  ['pods', 'po'],
  ['secrets'],
  ['serviceaccounts', 'sa'],
  ['services', 'svc'],
  ['addonsconfigurations', 'addons'],
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

function getAutocompleteEntries({ tokens, namespace, resourceCache }) {
  const fullResourceType = toFullResourceType(
    tokens[0],
    namespacedResourceTypes,
  );
  const resources = resourceCache[`${namespace}/${fullResourceType}`] || [];

  return autocompleteForResources({
    tokens,
    resources,
    resourceTypes: namespacedResourceTypes,
  });
}

function getSuggestions({ tokens, namespace, resourceCache }) {
  const [type, name] = tokens;
  const suggestedType = getSuggestion(
    type,
    namespacedResourceTypes.flatMap(n => n),
  );
  if (name) {
    const fullResourceType = toFullResourceType(type, namespacedResourceTypes);
    const resourceNames = (
      resourceCache[`${namespace}/${fullResourceType}`] || []
    ).map(n => n.metadata.name);
    const suggestedName = getSuggestion(name, resourceNames);
    if (suggestedType && suggestedName) {
      return `${suggestedType} ${suggestedName}`;
    }
  } else {
    return suggestedType;
  }
}

function makeListItem(item, matchedNode, t) {
  const namespacePart = `namespaces/${item.metadata.namespace}`;
  const detailsPart = `details/${item.metadata.name}`;
  const link = `${namespacePart}/${matchedNode.pathSegment}/${detailsPart}`;

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

function getApiPathForQuery({ tokens, namespaceNodes }) {
  const resourceType = toFullResourceType(tokens[0], namespacedResourceTypes);
  return getApiPath(resourceType, namespaceNodes);
}

async function fetchNamespacedResource(context) {
  const apiPath = getApiPathForQuery(context);
  if (!apiPath) {
    return;
  }

  const { fetch, namespace, tokens, updateResourceCache } = context;
  const resourceType = toFullResourceType(tokens[0], namespacedResourceTypes);
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

  const resourceType = toFullResourceType(type, namespacedResourceTypes);
  const matchedNode = namespaceNodes.find(n => n.resourceType === resourceType);

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
};
