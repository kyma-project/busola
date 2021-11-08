import { useTranslation } from 'react-i18next';

export const grantTypes = {
  client_credentials: 'Client credentials',
  authorization_code: 'Authorization code',
  implicit: 'Implicit',
  refresh_token: 'Refresh token',
};

export const GrantTypes = () => {
  const { t } = useTranslation();

  return {
    client_credentials: t('oauth2-clients.grand-types.client-credentials'),
    authorization_code: t('oauth2-clients.grand-types.authorization-code'),
    implicit: t('oauth2-clients.grand-types.implicit'),
    refresh_token: t('oauth2-clients.grand-types.refresh-token'),
  };
};

export const ResponseTypes = () => {
  const { t } = useTranslation();

  return {
    id_token: t('oauth2-clients.response-types.id-token'),
    code: t('oauth2-clients.response-types.code'),
    token: t('oauth2-clients.response-types.token'),
  };
};

export const responseTypes = {
  id_token: 'ID token',
  code: 'Code',
  token: 'Token',
};

export function validateSpec(spec) {
  const { grantTypes, scope } = spec;
  return grantTypes.length >= 1 && !!scope;
}

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
      tokenEndpointAuthMethod: 'client_secret_basic',
    },
  };
  // name: '',
  // scope: '',
  // responseTypes: [],
  // grantTypes: [],
  // secretName: '',
}
