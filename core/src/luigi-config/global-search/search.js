const k8sResources = [
  { aliases: ['configmaps', 'cm'], isNamespaced: true },
  { aliases: ['namespaces', 'ns'] },
  { aliases: ['nodes', 'no'] },
  { aliases: ['pods', 'po'], isNamespaced: true },
  { aliases: ['secrets'], isNamespaced: true },
  { aliases: ['serviceaccounts', 'sa'], isNamespaced: true },
  { aliases: ['services', 'svc'], isNamespaced: true },
  { aliases: ['addonsconfigurations'], isNamespaced: true },
  { aliases: ['clusteraddonsconfigurations'] },
  // { aliases: ['customresourcedefinitions', 'crd', 'crds'] },
  { aliases: ['applications', 'app'] },
  { aliases: ['daemonsets', 'ds'], isNamespaced: true },
  { aliases: ['deployments', 'deploy'], isNamespaced: true },
  { aliases: ['replicasets', 'rs'], isNamespaced: true },
  { aliases: ['statefulsets', 'sts'], isNamespaced: true },
  { aliases: ['cronjobs', 'cj'], isNamespaced: true },
  { aliases: ['jobs', 'batch'], isNamespaced: true },
  { aliases: ['certificates', 'cert'], isNamespaced: true },
  { aliases: ['issuers', 'issuer'], isNamespaced: true },
  { aliases: ['dnsentries', 'dnse'], isNamespaced: true },
  { aliases: ['dnsproviders', 'dnspr'], isNamespaced: true },
  { aliases: ['subscriptions'], isNamespaced: true },
  { aliases: ['ingresses', 'ing'], isNamespaced: true },
  { aliases: ['apirules'], isNamespaced: true },
  { aliases: ['oauth2clients', 'hydra.ory.sh'], isNamespaced: true },
  { aliases: ['pods', 'metrics.k8s.io'], isNamespaced: true },
  { aliases: ['destinationrules', 'dr'], isNamespaced: true },
  { aliases: ['gateways', 'gw'], isNamespaced: true },
  { aliases: ['virtualservices', 'vs'], isNamespaced: true },
  { aliases: ['clusterrolebindings'] },
  { aliases: ['clusterroles'] },
  { aliases: ['rolebindings'], isNamespaced: true },
  { aliases: ['roles'], isNamespaced: true },
  { aliases: ['functions'], isNamespaced: true },
  { aliases: ['gitrepositories'], isNamespaced: true },
];

const createNonResourceOptions = cluster => [
  {
    names: ['clusters'],
    type: 'clusters',
  },
  {
    names: ['options', 'prefs', 'preferences', 'settings'],
    type: 'preferences',
  },
  {
    names: ['h', 'help'],
    type: 'show-help',
  },
  ...(cluster
    ? [
        {
          names: ['overview'],
          type: 'overview',
        },
      ]
    : []),
];

async function getNavigationNodes() {
  let nsNodes = [];
  let clusterNodes = [];

  const clusterParentNode = Luigi.getConfig().navigation.nodes.find(
    n => n.pathSegment === 'cluster',
  );
  if (clusterParentNode) {
    clusterNodes = await clusterParentNode.children[0].children();

    const namespaceParentNode = clusterNodes.find(
      n => n.pathSegment === 'namespaces',
    );
    if (namespaceParentNode) {
      nsNodes = await namespaceParentNode.children[0].children();
    }
  }
  return {
    clusterNodes,
    nsNodes,
  };
}

function check(resourceType, nodes) {
  const r = k8sResources.find(r => r.aliases.includes(resourceType));
  if (r) {
    resourceType = r.aliases[0];
  }

  const matchedNode = nodes.find(n => n.resourceType === resourceType);
  if (matchedNode) {
    const resourceApiPath = new URL(matchedNode.viewUrl).searchParams.get(
      'resourceApiPath',
    );
    // const fullResourceApiPath = queryParams.get('fullResourceApiPath');

    console.log(resourceApiPath + '/' + resourceType);
  }
  return matchedNode;
}

export async function search(searchString, context) {
  const tokens = searchString.split(/\s+/).filter(Boolean);

  // const nonResourceOptions = createNonResourceOptions(context.cluster);

  const { clusterNodes, nsNodes } = await getNavigationNodes();

  console.log(check(tokens[0], clusterNodes));
  console.log(check(tokens[0], nsNodes));

  return { suggestion: 'aaa', searchResults: [{ label: 'dupsko' }] };
}
