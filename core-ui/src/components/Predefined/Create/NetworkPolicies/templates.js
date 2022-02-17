export function createNetworkPolicyTemplate(namespace) {
  return {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'NetworkPolicy',
    metadata: {
      name: '',
      namespace,
    },
    spec: {
      podSelector: {},
      policyTypes: ['Ingress'],
    },
  };
}
