import OpenIdConnect from '@luigi-project/plugin-auth-oidc';
import { clearInitParams } from './init-params';
import { UserManager, Log } from 'oidc-client';

Log.logger = console;

let userManager;

export let groups;

export async function refreshAuth() {
  await userManager.signinSilent();
  const { id_token } = await userManager.getUser();

  const auth = Luigi.auth().store.getAuthData();
  Luigi.auth().store.setAuthData({ ...auth, idToken: id_token });

  const navigation = await Luigi.getConfigValue('navigation.nodes');
  const context = navigation[0].context;
  context.authData.idToken = id_token;
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

  userManager = new UserManager({
    authority: issuerUrl,
    metadata: providerMetadata,
    client_id: clientId,
    response_type: 'id_token',
    scope,
    silent_redirect_uri: window.location.origin + '/silentCallback.html',
  });

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
        clearInitParams();
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
