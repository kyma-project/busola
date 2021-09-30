import { saveCurrentLocation } from '../navigation/previous-location';
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

export async function createSSOAuth({ locationpathname }) {
  try {
    const ssoFeature = (await getBusolaClusterParams()).config.features
      .SSO_LOGIN;

    const { issuerUrl, clientId, scope } = ssoFeature.config;

    const OpenIdConnect = await importOpenIdConnect();
    console.log('create sso auth');

    if (locationpathname !== '/') {
      console.log('loc', locationpathname);
      saveCurrentLocation(locationpathname);
    } else {
      console.log('not save', locationpathname);
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
        userInfoFn: (_, authData) => {
          setSSOAuthData(authData);
          location.reload();
          return Promise.resolve({});
        },
      },

      events: {
        onLogout: () => {
          console.log('onLogout');
        },
        onAuthExpired: () => {
          console.log('onAuthExpired');
        },
        onAuthError: (_config, err) => {
          window.location.href = '/clusters' + convertToURLsearch(err);
          return false; // return false to prevent OIDC plugin navigation
        },
        // onAuthSuccessful: (_config, data) => {
        //   console.log(data);
        // },
      },
      storage: 'none',
    };
  } catch (e) {
    console.warn(e);
    alert('Cannot setup Busola SSO auth: ' + e.message);
  }
}
