import { saveLocation } from '../navigation/previous-location';
import { getBusolaClusterParams } from './../busola-cluster-params';
import { resolveFeatureAvailability } from './../features';

export function setSSOAuthData(data) {
  sessionStorage.setItem('SSO', JSON.stringify(data));
}

export function getSSOAuthData() {
  return JSON.parse(sessionStorage.getItem('SSO') || 'null');
}

export async function isSSOEnabled() {
  const features = (await getBusolaClusterParams()).config?.features || {};
  return await resolveFeatureAvailability(features.SSO_LOGIN, null);
}

async function importOpenIdConnect() {
  return (await import('@luigi-project/plugin-auth-oidc')).default;
}

async function createSSOAuth(callback) {
  try {
    const ssoFeature = (await getBusolaClusterParams()).config.features
      .SSO_LOGIN;

    const { issuerUrl, clientId, scope } = ssoFeature.config;

    const OpenIdConnect = await importOpenIdConnect();

    const locationpathname = location.pathname + location.search;
    if (
      locationpathname !== '/' &&
      locationpathname !== '/clusters' &&
      !locationpathname.startsWith('/?code')
    ) {
      saveLocation(locationpathname);
    }

    return {
      use: 'openIdConnect',
      openIdConnect: {
        idpProvider: OpenIdConnect,
        authority: issuerUrl,
        client_id: clientId,
        scope: scope || 'openid',
        response_type: 'code',
        response_mode: 'query',
        loadUserInfo: false,
        userInfoFn: async (_, authData) => {
          console.log('sso logged in');
          setSSOAuthData(authData);
          callback();
          return Promise.resolve({});
        },
      },

      events: {
        onAuthError: (_config, err) => {
          console.log('sso err', err);
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
  if (!(await isSSOEnabled()) || getSSOAuthData()) {
    return;
  }
  return new Promise(async resolve => {
    Luigi.setConfig({
      auth: await createSSOAuth(resolve),
      lifecycleHooks: { luigiAfterInit },
    });
  });
}
