import { getBusolaClusterParams } from './../busola-cluster-params';
import parseJWT from 'jwt-decode';
import { convertToURLsearch } from '../communication';

const SSO_KEY = 'SSO';

export function setSSOAuthData(data) {
  sessionStorage.setItem(SSO_KEY, JSON.stringify(data));
}

export function getSSOAuthData() {
  return JSON.parse(sessionStorage.getItem(SSO_KEY) || 'null');
}

export async function isSSOEnabled() {
  const features = (await getBusolaClusterParams()).config?.features || {};
  return features.SSO_LOGIN?.isEnabled === true;
}

async function importOpenIdConnect() {
  return (await import('@luigi-project/plugin-auth-oidc')).default;
}

async function createSSOAuth(callback) {
  try {
    const ssoFeature = (await getBusolaClusterParams()).config.features
      .SSO_LOGIN;

    const { issuerUrl, clientId, clientSecret, scope } = ssoFeature.config;
    const OpenIdConnect = await importOpenIdConnect();

    return {
      use: 'openIdConnect',
      openIdConnect: {
        idpProvider: OpenIdConnect,
        authority: issuerUrl,
        client_id: clientId,
        client_secret: clientSecret,
        scope: scope || 'openid',
        response_type: 'code',
        response_mode: 'query',
        loadUserInfo: false,
        userInfoFn: async (_, authData) => {
          setSSOAuthData(authData);
          callback();
          return Promise.resolve({});
        },
      },
      events: {
        onAuthError: (_config, err) => {
          console.warn('sso err', err);
          window.location.href = '/clusters' + convertToURLsearch(err);
          return false; // return false to prevent OIDC plugin navigation
        },
      },
      storage: 'none',
    };
  } catch (e) {
    console.warn(e);
    alert('Cannot setup Busola SSO auth: ' + e.message);
  }
}

export async function ssoLogin(luigiAfterInit) {
  // don't run login flow if we already have authData
  if (!(await isSSOEnabled())) {
    return;
  }

  const token = getSSOAuthData()?.idToken;
  if (token) {
    const timeout = 30; // s
    const expirationTimestamp = parseJWT(token).exp;
    const secondsLeft = new Date(expirationTimestamp) - Date.now() / 1000;
    if (secondsLeft > timeout) {
      return;
    } else {
      // we require a new token
      sessionStorage.removeItem(SSO_KEY);
    }
  }

  return new Promise(async resolve => {
    window.Luigi.setConfig({
      auth: await createSSOAuth(resolve),
      lifecycleHooks: { luigiAfterInit },
    });
  });
}
