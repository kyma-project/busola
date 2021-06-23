export const createOAuthClient = (namespace, spec) => {
  const { name, grantTypes, responseTypes, secretName, scope } = spec;
  return {
    apiVersion: 'hydra.ory.sh/v1alpha1',
    kind: 'OAuth2Client',
    metadata: {
      name,
      namespace,
    },
    spec: {
      grantTypes,
      // we can either specify a non-empty array, or null - empty array is forbidden
      responseTypes: responseTypes?.length ? responseTypes : null,
      scope,
      secretName,
    },
  };
};
