import { jwtDecode } from 'jwt-decode';
import { UserManager } from 'oidc-client-ts';
import { atom, RecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { configurationAtom } from './configuration/configurationAtom';
import { ConfigFeature } from './types';
import { useEffect } from 'react';

export type SsoDataState = {
  idToken?: string;
} | null;

const defaultValue: SsoDataState = getSSOAuthToken();

export const ssoDataState: RecoilState<SsoDataState> = atom<SsoDataState>({
  key: 'ssoDataState',
  default: defaultValue,
});

const SSO_KEY = 'SSO';

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

export function useIsSSOEnabled() {
  const ssoConfig = useRecoilValue(configurationAtom)?.features?.SSO_LOGIN;
  return ssoConfig?.isEnabled === true;
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

    console.log(user);
    userManager.events.addAccessTokenExpiring(async () => {
      const user = await userManager.signinSilent();
      setSSOAuthData(user);
      setSsoState({ idToken: user?.id_token });
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
          setSsoState({ idToken: user?.id_token });
        }
      }
    });

    setSSOAuthData(user);
    setSsoState({ idToken: user?.id_token });

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
  const setSsoState = useSetRecoilState(ssoDataState);
  const isSSOEnabled = useIsSSOEnabled();

  useEffect(() => {
    if (!isSSOEnabled || getSSOAuthData()?.idToken) {
      return;
    }

    const onAfterLogin = user => {
      setSSOAuthData(user);
      setSsoState({ idToken: user?.id_token });
    };

    handleSSOLogin(ssoConfig, onAfterLogin, setSsoState);
  }, [isSSOEnabled]);
}

const convertToURLsearch = (params: { [x: string]: string }) => {
  const a = Object.keys(params).map(k => '~' + k + '=' + params[k]);
  return '?' + a.join('&');
};
