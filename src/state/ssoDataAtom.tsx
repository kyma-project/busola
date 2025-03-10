import { jwtDecode } from 'jwt-decode';
import { User, UserManager } from 'oidc-client-ts';
import {
  atom,
  RecoilState,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import { configurationAtom } from './configuration/configurationAtom';
import { ConfigFeature } from './types';
import { useEffect } from 'react';

const SSO_KEY = 'SSO';

const defaultValue: User = getSSOAuthData();

export const ssoDataState: RecoilState<User> = atom<User>({
  key: 'ssoDataState',
  default: defaultValue,
});

export function setSSOAuthData(data) {
  sessionStorage.setItem(SSO_KEY, JSON.stringify(data));
}

export function getSSOAuthData() {
  return JSON.parse(sessionStorage.getItem(SSO_KEY) || 'null');
}

export function getSSOAuthToken() {
  return JSON.parse(sessionStorage.getItem('SSO') || 'null')?.id_token
    ? {
        idToken: JSON.parse(sessionStorage.getItem('SSO') || 'null')?.id_token,
      }
    : null;
}

export function useSSOConfig() {
  return useRecoilValue(configurationAtom)?.features?.SSO_LOGIN;
}

export function getIsSSOEnabled() {
  return process.env.NODE_ENV !== 'development';
}

function createSSOAuth(ssoConfig: ConfigFeature) {
  const { issuerUrl, clientId, clientSecret, scope } = ssoConfig.config;

  return new UserManager({
    redirect_uri: window.location.origin + '', ////TODO redirect path
    post_logout_redirect_uri: window.location.origin + '/logout.html', ////????
    loadUserInfo: false,
    client_id: clientId,
    authority: issuerUrl,
    client_secret: clientSecret,
    scope: scope || 'openid',
    response_type: 'code',
    response_mode: 'query',
  });
}
async function handleSSOLogin(ssoConfig, onAfterLogin, setSsoState) {
  if (!ssoConfig || !ssoConfig.config) {
    throw new Error('SSO configuration not found');
  }
  const userManager = createSSOAuth(ssoConfig);

  try {
    // Check if the user is already authenticated
    const storedUser = await userManager?.getUser();
    const user =
      storedUser && !storedUser.expired
        ? storedUser
        : await userManager?.signinRedirectCallback(window.location.href);

    userManager.events.addAccessTokenExpiring(async () => {
      const user = await userManager.signinSilent();
      setSSOAuthData(user);
      setSsoState(user);
    });
    userManager.events.addSilentRenewError(err => {
      console.warn('silent renew failed', err);
      setSsoState(null);
      setSSOAuthData(null);
    });
    document.addEventListener('visibilitychange', async event => {
      if (document.visibilityState === 'visible') {
        if (!!user?.expired || (user?.expires_in && user?.expires_in <= 2)) {
          const user = await userManager.signinSilent();
          setSSOAuthData(user);
          setSsoState(user);
        }
      }
    });

    setSSOAuthData(user);
    setSsoState(user);

    onAfterLogin(user);
  } catch (e) {
    if (e instanceof Error) {
      await userManager.clearStaleState();
      userManager.signinRedirect();
    } else {
      throw e;
    }
  }
}

export function useSSOLogin() {
  const ssoConfig = useSSOConfig();
  const [ssoState, setSsoState] = useRecoilState(ssoDataState);
  const isSSOEnabled = getIsSSOEnabled();

  useEffect(() => {
    if (!isSSOEnabled || getSSOAuthData()?.id_token || ssoState?.id_token) {
      return;
    }

    const onAfterLogin = user => {
      setSSOAuthData(user);
      setSsoState(user);
    };

    handleSSOLogin(ssoConfig, onAfterLogin, setSsoState);
  }, [isSSOEnabled]);
}

const convertToURLsearch = (params: { [x: string]: string }) => {
  const a = Object.keys(params).map(k => '~' + k + '=' + params[k]);
  return '?' + a.join('&');
};
