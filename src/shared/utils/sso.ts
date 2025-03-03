import { jwtDecode } from 'jwt-decode';
import { useRecoilValue } from 'recoil';
import { configurationAtom } from 'state/configuration/configurationAtom';
import { ConfigFeature } from 'state/types';

const SSO_KEY = 'SSO';

export function setSSOAuthData(data: any) {
  sessionStorage.setItem(SSO_KEY, JSON.stringify(data));
}

export function getSSOAuthData() {
  return JSON.parse(sessionStorage.getItem(SSO_KEY) || 'null');
}

export function useSSOConfig() {
  return useRecoilValue(configurationAtom)?.features?.SSO_LOGIN;
}

export function isSSOEnabled(ssoConfig: ConfigFeature | undefined) {
  return ssoConfig?.isEnabled === true;
}

function createSSOAuth(ssoConfig: ConfigFeature | undefined) {
  try {
    if (!ssoConfig || !ssoConfig.config) {
      throw new Error('SSO configuration not found');
    }

    const { issuerUrl, clientId, scope } = ssoConfig.config;

    return {
      use: 'openIdConnect',
      openIdConnect: {
        authority: issuerUrl,
        client_id: clientId,
        scope: scope || 'openid',
        response_type: 'code',
        response_mode: 'query',
        loadUserInfo: false,
        userInfoFn: async (_, authData) => {
          setSSOAuthData(authData);
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

export function useSSOLogin() {
  const ssoConfig = useSSOConfig();

  return async function ssoLogin() {
    if (!isSSOEnabled(ssoConfig)) {
      return;
    }

    const token = getSSOAuthData()?.idToken;

    if (token) {
      const timeout = 30;
      const expirationTimestamp = jwtDecode(token).exp;
      const secondsLeft = expirationTimestamp ?? 0 - Date.now() / 1000;
      if (secondsLeft > timeout) {
        return;
      } else {
        sessionStorage.removeItem(SSO_KEY);
      }
    }

    return createSSOAuth(ssoConfig);
  };
}

const convertToURLsearch = (params: { [x: string]: string }) => {
  const a = Object.keys(params).map(k => '~' + k + '=' + params[k]);
  return '?' + a.join('&');
};
