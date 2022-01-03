import pluralize from 'pluralize';
import { getSuggestion, getApiPath } from './helpers';

const clusterwideResources = [
  ['clusterrolebindings'],
  ['clusterroles'],
  ['applications', 'app', 'apps'],
  ['clusteraddonsconfigurations'],
  ['namespaces', 'ns'],
  ['nodes', 'no'],
];

const namespacedResources = [
  ['configmaps', 'cm'],
  ['pods', 'po'],
  ['secrets'],
  ['serviceaccounts', 'sa'],
  ['services', 'svc'],
  ['addonsconfigurations'],
  ['customresourcedefinitions', 'crd', 'crds'],
  ['daemonsets', 'ds'],
  ['deployments', 'deploy'],
  ['replicasets', 'rs'],
  ['statefulsets', 'sts'],
  ['cronjobs', 'cj'],
  ['jobs'],
  ['certificates', 'cert'],
  ['issuers', 'issuer'],
  ['dnsentries', 'dnse'],
  ['dnsproviders', 'dnspr'],
  ['subscriptions'],
  ['ingresses', 'ing'],
  ['apirules'],
  ['oauth2clients'],
  ['destinationrules', 'dr'],
  ['gateways', 'gw'],
  ['virtualservices', 'vs'],
  ['rolebindings'],
  ['roles'],
  ['functions', 'fn'],
  ['gitrepositories'],
].map(aliases => [...aliases, pluralize(aliases[0], 1)]);

async function getClusterNodes() {
  const clusterParentNode = Luigi.getConfig().navigation.nodes.find(
    n => n.pathSegment === 'cluster',
  );
  if (clusterParentNode) {
    return await clusterParentNode.children[0].children();
  } else {
    return [];
  }
}

async function getNamespaceNodes() {
  const clusterNodes = await getClusterNodes();

  const namespaceParentNode = clusterNodes.find(
    n => n.pathSegment === 'namespaces',
  );
  if (namespaceParentNode) {
    return await namespaceParentNode.children[0].children();
  } else {
    return [];
  }
}

function dealiasize(resourceType) {
  return (
    [...clusterwideResources, ...namespacedResources].find(r =>
      r.includes(resourceType),
    )?.[0] || resourceType
  );
}

function makeListItem(item, cluster, matchedNode) {
  return {
    label: `${matchedNode.resourceType} ${item.metadata.name}`,
    onClick: () => {
      // why
      const detailsLink =
        matchedNode.resourceType === 'namespaces'
          ? `/${item.metadata.name}/details`
          : `/details/${item.metadata.name}`;
      Luigi.navigation().navigate(
        `/cluster/${cluster}/` + matchedNode.pathSegment + detailsLink,
      );
    },
  };
}

async function clusterwideResourceHandler2(
  clusterNodes,
  { fetch, cluster, tokens },
) {
  const resourceType = dealiasize(tokens[0]);

  const matchedNode = clusterNodes.find(n => n.resourceType === resourceType);
  const resourceApiPath = getApiPath(matchedNode?.viewUrl);

  if (resourceApiPath) {
    // const fullResourceApiPath = queryParams.get('fullResourceApiPath');

    const linkToList = {
      label: `${resourceType} list`,
      onClick: () =>
        Luigi.navigation().navigate(
          `/cluster/${cluster}/${matchedNode.pathSegment}`,
        ),
    };

    try {
      const response = await fetch(resourceApiPath + '/' + resourceType);
      const { items } = await response.json();

      if (tokens[1]) {
        const matchedByName = items.filter(item =>
          item.metadata.name.includes(tokens[1]),
        );
        if (matchedByName) {
          return [
            linkToList,
            ...matchedByName.map(i => makeListItem(i, cluster, matchedNode)),
          ];
        }
        //wtf naming
        return [linkToList];
      } else {
        return [
          linkToList,
          ...items.map(i => makeListItem(i, cluster, matchedNode)),
        ];
      }
    } catch (e) {
      console.log(e);
    }
  }
  return null;
}

async function namespacedResourceHandler2(
  namespaceNodes,
  { fetch, cluster, namespace, tokens },
) {
  const resourceType = dealiasize(tokens[0]);

  const matchedNode = namespaceNodes.find(n => n.resourceType === resourceType);
  const resourceApiPath = getApiPath(matchedNode?.viewUrl);

  if (resourceApiPath) {
    // const fullResourceApiPath = queryParams.get('fullResourceApiPath');
    try {
      const response = await fetch(resourceApiPath + '/' + resourceType);
      let { items } = await response.json();
      if (namespace) {
        items = items.filter(item => item.metadata.namespace === namespace);
      }
      return [
        {
          label: `${resourceType} list`,
          onClick: () =>
            Luigi.navigation().navigate(
              `/cluster/${cluster}/namespaces/${namespace || 'default'}/` +
                matchedNode.pathSegment,
            ),
        },
        ...items.map(item => ({
          label: `${resourceType} ${item.metadata.namespace}/${item.metadata.name}`,
          onClick: () => {
            Luigi.navigation().navigate(
              `/cluster/${cluster}/namespaces/${item.metadata.namespace}/` +
                matchedNode.pathSegment +
                `/details/${item.metadata.name}`,
            );
          },
        })),
      ];
    } catch (e) {
      console.log(e);
      console.log(matchedNode);
    }
  }
  return null;
}

export async function clusterwideResourceHandler(context) {
  const clusterNodes = await getClusterNodes();
  const searchResults = await clusterwideResourceHandler2(
    clusterNodes,
    context,
  );
  return {
    searchResults,
    suggestion: getSuggestion(
      context.tokens[0],
      clusterwideResources.flatMap(r => r),
    ),
  };
}

export async function namespacedResourceHandler(context) {
  const namespaceNodes = await getNamespaceNodes();
  const searchResults = await namespacedResourceHandler2(
    namespaceNodes,
    context,
  );
  return {
    searchResults,
    suggestion: getSuggestion(
      context.tokens[0],
      namespacedResources.flatMap(r => r),
    ),
  };
}
