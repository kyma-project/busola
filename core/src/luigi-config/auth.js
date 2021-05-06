import OpenIdConnect from '@luigi-project/plugin-auth-oidc';
import { setAuthData } from './auth-storage';
import { getActiveCluster } from './clusters';

export let groups;

export async function reloadAuth() {
  if (params?.rawAuth) {
    setAuthData(params.rawAuth);
  }
  const params = getActiveCluster();
  const auth = params?.auth && (await createAuth(params.auth));
  Luigi.setConfig({ ...Luigi.getConfig(), auth });
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
  }
}

export const createAuth = async (authParams) => {
  if (!authParams) {
    // create dummy auth just for storing auth data
    return { storage: 'none' };
  }

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
        setAuthData(authData);
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
