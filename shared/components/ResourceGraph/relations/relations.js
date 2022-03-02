import * as matchers from './matchers';

export function match(resourceA, resourceB) {
  const kindA = resourceA.kind;
  const kindB = resourceB.kind;

  let matcher = null;
  if (matchers[`match${kindA}And${kindB}`]) {
    matcher = matchers[`match${kindA}And${kindB}`];
  } else {
    matcher = matchers[`match${kindB}And${kindA}`];
    // order matters!
    [resourceA, resourceB] = [resourceB, resourceA];
  }

  if (matcher) {
    try {
      return matcher(resourceA, resourceB);
    } catch (e) {
      console.warn(matcher.name);
      console.warn(e);
      return false;
    }
  } else {
    console.warn('No matcher found for ', kindA, '&', kindB);
    return false;
  }
}

export function matchBy(singleResource, resources) {
  return resources?.filter(res => match(res, singleResource)) || [];
}

export const networkFlow = [
  'User Request',
  'VirtualService',
  'APIRule',
  'Service',
  'Deployment',
];

export const relations = {
  Role: [
    {
      kind: 'RoleBinding',
    },
  ],
  ClusterRole: [
    {
      kind: 'ClusterRoleBinding',
      namespaced: false,
    },
    {
      kind: 'RoleBinding',
    },
  ],
  ClusterRoleBinding: [
    {
      kind: 'ClusterRole',
      namespaced: false,
    },
    {
      kind: 'ServiceAccount',
    },
  ],
  RoleBinding: [
    {
      kind: 'ClusterRole',
      namespaced: false,
    },
    {
      kind: 'Role',
    },
    {
      kind: 'ServiceAccount',
      namespaced: false,
    },
  ],
  Deployment: [
    {
      kind: 'Service',
      labelKey: 'resource-graph.relations.exposed-by',
    },
    {
      kind: 'HorizontalPodAutoscaler',
    },
    {
      kind: 'ReplicaSet',
    },
  ],
  ReplicaSet: [
    {
      kind: 'Deployment',
    },
    {
      kind: 'Pod',
    },
  ],
  Pod: [
    {
      kind: 'ReplicaSet',
    },
    {
      kind: 'Secret',
    },
    {
      kind: 'ConfigMap',
    },
  ],
  Service: [
    {
      kind: 'Deployment',
      labelKey: 'resource-graph.relations.exposes',
    },
    {
      kind: 'APIRule',
      labelKey: 'resource-graph.relations.exposed-by',
    },
    {
      kind: 'Function',
    },
  ],
  ServiceAccount: [
    {
      kind: 'ClusterRoleBinding',
      namespaced: false,
    },
    {
      kind: 'RoleBinding',
      namespaced: false,
    },
    {
      kind: 'Secret',
    },
  ],
  APIRule: [
    {
      kind: 'Service',
      labelKey: 'resource-graph.relations.exposes',
    },
    {
      kind: 'VirtualService',
    },
    {
      kind: 'Gateway',
      namespaced: false,
    },
  ],
  Gateway: [
    {
      kind: 'APIRule',
      namespaced: false,
    },
  ],
  Function: [
    {
      kind: 'Service',
    },
  ],
  HorizontalPodAutoscaler: [
    {
      kind: 'Deployment',
    },
  ],
  Secret: [
    {
      kind: 'Pod',
    },
    {
      kind: 'ServiceAccount',
    },
    {
      kind: 'OAuth2Client',
    },
  ],
  OAuth2Client: [
    {
      kind: 'Secret',
    },
  ],
  ConfigMap: [
    {
      kind: 'Pod',
    },
  ],
  VirtualService: [
    {
      kind: 'APIRule',
    },
  ],
};

/*
export const relations = {
  ClusterRole: [
    {
      kind: 'ClusterRoleBinding',
      namespaced: false,
      selectBy: (cr, crbs) => crbs.filter(crb => match(cr, crb)),
    },
  ],
  ClusterRoleBinding: [
    {
      kind: 'ClusterRole',
      namespaced: false,
      selectBy: (crb, clusterRoles) =>
        clusterRoles.filter(cr => match(cr, crb)),
    },
    {
      kind: 'ServiceAccount',
      selectBy: (crb, serviceAccounts) =>
        serviceAccounts.filter(sa => match(crb, sa)),
    },
  ],
  Deployment: [
    {
      kind: 'Pod',
      selectBy: (deployment, pods) =>
        pods.filter(pod => match(pod, deployment)),
    },
    {
      kind: 'Service',
      labelKey: 'resource-graph.relations.exposed-by',
      selectBy: (deployment, services) =>
        services.filter(service => match(deployment, service)),
    },
    {
      kind: 'HorizontalPodAutoscaler',
      selectBy: (deployment, hpas) =>
        hpas.filter(hpa => match(deployment, hpa)),
    },
    {
      kind: 'ReplicaSet',
      selectBy: (deployment, replicaSets) =>
        replicaSets.filter(rs => match(deployment, rs)),
    },
  ],
  ReplicaSet: [
    {
      kind: 'Deployment',
      selectBy: (rs, deployments) =>
        deployments.filter(deployment => match(deployment, rs)),
    },
  ],
  Pod: [
    {
      kind: 'Deployment',
      selectBy: (pod, deployments) =>
        deployments.filter(deployment => match(pod, deployment)),
    },
    {
      kind: 'Secret',
      selectBy: (pod, secrets) => secrets.filter(secret => match(pod, secret)),
    },
    {
      kind: 'ConfigMap',
      selectBy: (pod, configMaps) => configMaps.filter(cm => match(pod, cm)),
    },
  ],
  Service: [
    {
      kind: 'Deployment',
      labelKey: 'resource-graph.relations.exposes',
      selectBy: (service, deployments) =>
        deployments.filter(deployment => match(deployment, service)),
    },
    {
      kind: 'APIRule',
      labelKey: 'resource-graph.relations.exposed-by',
      selectBy: (service, apiRules) =>
        apiRules.filter(apiRule => match(apiRule, service)),
    },
    {
      kind: 'Function',
      selectBy: (service, functions) =>
        functions.filter(f => match(service, f)),
    },
  ],
  ServiceAccount: [
    {
      kind: 'ClusterRoleBinding',
      namespaced: false,
      selectBy: (sa, crbs) => crbs.filter(crb => match(crb, sa)),
    },
    {
      kind: 'Secret',
      selectBy: (sa, secrets) => secrets.filter(secret => match(secret, sa)),
    },
  ],
  APIRule: [
    {
      kind: 'Service',
      labelKey: 'resource-graph.relations.exposes',
      selectBy: (apiRule, services) =>
        services.filter(service => match(apiRule, service)),
    },
    {
      kind: 'VirtualService',
      selectBy: (apiRule, virtualServices) =>
        virtualServices.filter(vs => match(apiRule, vs)),
    },
    {
      kind: 'Gateway',
      namespaced: false,
      selectBy: (apiRule, gateways) =>
        gateways.filter(gateway => match(apiRule, gateway)),
    },
  ],
  Gateway: [
    {
      kind: 'APIRule',
      namespaced: false,
      selectBy: (gateway, apiRules) =>
        apiRules.filter(apiRule => match(apiRule, gateway)),
    },
  ],
  Function: [
    {
      kind: 'Service',
      selectBy: (f, services) => services.filter(service => match(service, f)),
    },
  ],
  HorizontalPodAutoscaler: [
    {
      kind: 'Deployment',
      selectBy: (hpa, deployments) =>
        deployments.filter(deployment => match(hpa, deployment)),
    },
  ],
  Secret: [
    {
      kind: 'Pod',
      selectBy: (secret, pods) => pods.filter(pod => match(pod, secret)),
    },
    {
      kind: 'ServiceAccount',
      selectBy: (secret, serviceAccounts) =>
        serviceAccounts.filter(sa => match(secret, sa)),
    },
  ],
  ConfigMap: [
    {
      kind: 'Pod',
      selectBy: (cm, pods) => pods.filter(pod => match(cm, pod)),
    },
  ],
  VirtualService: [
    {
      kind: 'APIRule',
      selectBy: (vs, apiRules) =>
        apiRules.filter(apiRule => match(apiRule, vs)),
    },
  ],
};
 */
