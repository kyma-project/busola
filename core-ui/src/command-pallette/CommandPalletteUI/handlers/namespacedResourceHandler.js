import LuigiClient from '@luigi-project/client';
import pluralize from 'pluralize';
import { LOADING_INDICATOR } from '../useSearchResults';
import {
  getSuggestion,
  getApiPath,
  toFullResourceType,
  autocompleteForResources,
} from './helpers';

const resourceTypes = [
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
  ['gitrepositories', 'gitrepos', 'repos'],
  ['horizontalpodautoscalers', 'hpa'],
  ['persistentvolumeclaims', 'pvc'],
  ['serviceentries', 'se'],
  ['sidecars'],
];
const extendedResourceTypes = resourceTypes.map(aliases => [
  ...aliases,
  pluralize(aliases[0], 1),
]);

function getAutocompleteEntries({ tokens, namespace, resourceCache }) {
  const fullResourceType = toFullResourceType(tokens[0], extendedResourceTypes);
  const resources = resourceCache[`${namespace}/${fullResourceType}`] || [];

  return autocompleteForResources({
    tokens,
    resources,
    resourceTypes: extendedResourceTypes,
  });
}

function getSuggestions({ tokens, namespace, resourceCache }) {
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
    const resourceNames = (
      resourceCache[`${namespace}/${fullResourceType}`] || []
    ).map(n => n.metadata.name);
    const suggestedName = getSuggestion(name, resourceNames);
    return `${suggestedType} ${suggestedName}`;
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
  const resourceType = toFullResourceType(tokens[0], extendedResourceTypes);
  return getApiPath(resourceType, namespaceNodes);
}

async function fetchNamespacedResource(context) {
  const apiPath = getApiPathForQuery(context);
  if (!apiPath) {
    return;
  }

  const { fetch, namespace, tokens, updateResourceCache } = context;
  const resourceType = toFullResourceType(tokens[0], extendedResourceTypes);
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

  const resourceType = toFullResourceType(type, extendedResourceTypes);
  const matchedNode = namespaceNodes.find(
    n =>
      n.resourceType === resourceType || n.navigationContext === resourceType,
  );

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
  getNavigationHelp: () =>
    resourceTypes.map(types => {
      if (types.length === 1) {
        return [types[0]];
      } else {
        return [types[0], types[types.length - 1]];
      }
    }),
};
