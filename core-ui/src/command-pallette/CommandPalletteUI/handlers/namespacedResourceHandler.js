import LuigiClient from '@luigi-project/client';
import { LOADING_INDICATOR } from '../useSearchResults';
import { getApiPath } from 'shared/utils/helpers';
import {
  getSuggestion,
  toFullResourceType,
  autocompleteForResources,
} from './helpers';

const resourceTypes = [
  { resourceType: 'cronjobs', aliases: ['cj', 'cronjob', 'cronjobs'] },
  { resourceType: 'daemonsets', aliases: ['daemonset', 'daemonsets', 'ds'] },
  {
    resourceType: 'deployments',
    aliases: ['deploy', 'deployment', 'deployments', 'dp'],
  },
  { resourceType: 'configmaps', aliases: ['cm', 'configmap', 'configmaps'] },
  {
    resourceType: 'horizontalpodautoscalers',
    aliases: ['horizontalpodautoscaler', 'horizontalpodautoscalers', 'hpa'],
  },
  { resourceType: 'jobs', aliases: ['jo', 'job', 'jobs'] },
  { resourceType: 'ingresses', aliases: ['ing', 'ingress', 'ingresses'] },
  { resourceType: 'pods', aliases: ['po', 'pod', 'pods'] },
  {
    resourceType: 'limitranges',
    aliases: ['limitrange', 'limitranges', 'limits'],
  },
  {
    resourceType: 'resourcequotas',
    aliases: ['quota', 'resourcequota', 'resourcequotas'],
  },
  {
    resourceType: 'rolebindings',
    aliases: ['rb', 'rolebinding', 'rolebindings'],
  },
  { resourceType: 'roles', aliases: ['ro', 'role', 'roles'] },
  { resourceType: 'secrets', aliases: ['sec', 'secret', 'secrets'] },
  {
    resourceType: 'persistentvolumeclaims',
    aliases: ['persistentvolumeclaim', 'persistentvolumeclaims', 'pvc'],
  },
  { resourceType: 'services', aliases: ['service', 'services', 'svc'] },
  {
    resourceType: 'statefulsets',
    aliases: ['statefulset', 'statefulsets', 'sts'],
  },
  // we don't have nodes for those resources, but let's keep them here
  {
    resourceType: 'networkpolicies',
    aliases: ['netpol', 'networkpolicies', 'networkpolicy', 'np'],
  },
  { resourceType: 'serviceaccounts', aliases: ['sa', 'serviceaccount'] },
  { resourceType: 'replicasets', aliases: ['replicaset', 'replicasets', 'rs'] },
  // we don't have nodes for those resources, but let's keep them here
  {
    resourceType: 'replicationcontrollers',
    aliases: ['rc', 'replicationcontroller', 'replicationcontrollers'],
  },
  { resourceType: 'podtemplates', aliases: ['podtemplate', 'podtemplates'] },
  {
    resourceType: 'podsecuritypolicies',
    aliases: ['podsecuritypolicies', 'podsecuritypolicy', 'psp'],
  },
  {
    resourceType: 'poddisruptionbudgets',
    aliases: ['pdb', 'poddisruptionbudget', 'poddisruptionbudgets'],
  },
  { resourceType: 'leases', aliases: ['lease', 'leases'] },
  { resourceType: 'endpoints', aliases: ['endpoints', 'ep'] },
  {
    resourceType: 'csistoragecapacities',
    aliases: ['csistoragecapacities', 'csistoragecapacity'],
  },
  {
    resourceType: 'controllerrevisions',
    aliases: ['controllerrevision', 'controllerrevisions'],
  },
];

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
  const matchedNode = namespaceNodes.find(
    n =>
      n.resourceType === resourceType || n.navigationContext === resourceType,
  );

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
  getNavigationHelp: () => [], //todo
  // resourceTypes.map(types => {
  //   if (types.length === 1) {
  //     return [types[0]];
  //   } else {
  //     return [types[0], types[types.length - 1]];
  //   }
  // }),
};
