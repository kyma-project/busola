export const createAuthorizationPolicyTemplate = namespace => {
  return {
    apiVersion: 'security.istio.io/v1beta1',
    kind: 'AuthorizationPolicy',
    metadata: {
      name: '',
      namespace,
    },
    spec: {},
  };
};
