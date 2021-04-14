import OpenIdConnect from '@luigi-project/plugin-auth-oidc';
import { getInitParams, clearInitParams } from './init-params';
import { Auth0Client } from '@auth0/auth0-spa-js';

export let groups;

export async function refreshAuth() {
  const {
    auth: { issuerUrl, clientId },
  } = getInitParams();
  console.log({
    domain: issuerUrl.replace(/^https:\/\//, ''),
    client_id: clientId,
  });
  const auth0 = new Auth0Client({
    domain: issuerUrl.replace(/^https:\/\//, ''),
    client_id: clientId,
  });
  console.log(auth0);
  const token = await auth0.getTokenSilently();
  console.log(token);
  const claims = await auth0.getIdTokenClaims();
  const id_token = claims.__raw;
  console.log(claims);
  console.log(id_token);

  const auth = Luigi.auth().store.getAuthData();
  Luigi.auth().store.setAuthData({ ...auth, idToken: id_token });
  Luigi.configChanged('navigation.nodes');
}

async function fetchOidcProviderMetadata(issuerUrl) {
  try {
    const response = await fetch(
      `${issuerUrl}/.well-known/openid-configuration`
    );
    return await response.json();
  } catch (e) {
    alert(
      'Cannot fetch oidc provider metadata, see log console for more details'
    );
    console.error('cannot fetch OIDC metadata', e);
    clearInitParams();
    window.location = '/login.html';
  }
}

export const createAuth = async (authParams) => {
  const { issuerUrl, clientId, responseType, responseMode, scope } = authParams;

  const providerMetadata = await fetchOidcProviderMetadata(issuerUrl);
  const end_session_endpoint =
    providerMetadata.end_session_endpoint ||
    `${issuerUrl}/v2/logout?returnTo=${encodeURI(
      `${location.origin}/logout.html`
    )}&client_id=${clientId}&`;

  return {
    use: 'openIdConnect',
    openIdConnect: {
      idpProvider: OpenIdConnect,
      authority: issuerUrl,
      client_id: clientId,
      scope: scope || 'openid',
      response_type: responseType,
      response_mode: responseMode,
      automaticSilentRenew: true,
      loadUserInfo: false,
      logoutUrl: end_session_endpoint,
      metadata: {
        ...providerMetadata,
        end_session_endpoint,
      },
      userInfoFn: (_, authData) => {
        groups = authData.profile['http://k8s/groups'];
        return Promise.resolve({
          name: authData.profile.name,
          email: authData.profile.email,
        });
      },
    },

    events: {
      onLogout: () => {
        console.log('onLogout');
      },
      onAuthExpired: () => {
        console.log('onAuthExpired');
      },
      // TODO: define luigi-client api for getting errors
      onAuthError: (err) => {
        console.log('authErrorHandler 1', err);
      },
    },
    storage: 'none',
  };
};
