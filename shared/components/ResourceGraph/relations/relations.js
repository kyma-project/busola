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
      console.warn(e);
    }
  }
  return false;
}

export function matchBy(singleResource, resources) {
  return resources?.filter(res => match(res, singleResource)) || [];
}

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
    },
    {
      kind: 'APIRule',
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
