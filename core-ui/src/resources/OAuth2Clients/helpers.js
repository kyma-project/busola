export function createOAuth2ClientTemplate(namespace) {
  return {
    apiVersion: 'hydra.ory.sh/v1alpha1',
    kind: 'OAuth2Client',
    metadata: {
      name: '',
      namespace,
    },
    spec: {
      grantTypes: [],
      scope: '',
      secretName: '',
      tokenEndpointAuthMethod: 'client_secret_basic',
    },
  };
}
