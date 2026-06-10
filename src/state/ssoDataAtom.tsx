import { jwtDecode, JwtPayload } from 'jwt-decode';
import { User, UserManager } from 'oidc-client-ts';
import { atom, useAtom, useAtomValue } from 'jotai';
import { configurationAtom } from './configuration/configurationAtom';
import { ConfigFeature } from './types';
import { useEffect } from 'react';
import { getEnv, Envs } from 'shared/utils/env';

const SSO_KEY = 'SSO';

export type SsoDataState = User | null;

const defaultValue: SsoDataState = getSSOAuthData();

export const ssoDataAtom = atom<SsoDataState>(defaultValue);

export function setSSOAuthData(data: SsoDataState) {
  sessionStorage.setItem(SSO_KEY, JSON.stringify(data));
}

export function getSSOAuthData(): SsoDataState {
  return JSON.parse(sessionStorage.getItem(SSO_KEY) || 'null');
}

export function useIsSSOEnabled() {
  const configuration = useAtomValue(configurationAtom);
  return configuration?.features?.SSO_LOGIN?.isEnabled ?? false;
}

function createSSOAuth(ssoConfig: ConfigFeature) {
  const { issuerUrl, clientId, clientSecret, scope } = ssoConfig.config;

  return new UserManager({
    redirect_uri: window.location.origin + '',
    post_logout_redirect_uri: window.location.origin + '/logout.html',
    loadUserInfo: false,
    client_id: clientId,
    authority: issuerUrl,
    client_secret: clientSecret,
    scope: scope || 'openid',
    response_type: 'code',
    response_mode: 'query',
  });
}

async function handleSSOLogin(
  ssoConfig: ConfigFeature,
  setSsoState: (user: SsoDataState) => void,
) {
  if (!ssoConfig || !ssoConfig.config) {
    throw new Error('SSO configuration not found');
  }
  const userManager = createSSOAuth(ssoConfig);

  try {
    const storedUser = await userManager?.getUser();
    const user =
      storedUser && !storedUser.expired
        ? storedUser
        : await userManager?.signinRedirectCallback(window.location.href);

    userManager.events.addAccessTokenExpiring(async () => {
      const refreshedUser = await userManager.signinSilent();
      setSSOAuthData(refreshedUser);
      setSsoState(refreshedUser);
    });
    userManager.events.addSilentRenewError((err) => {
      console.warn('silent renew failed', err);
      setSsoState(null);
      setSSOAuthData(null);
    });
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        if (!!user?.expired || (user?.expires_in && user?.expires_in <= 2)) {
          const refreshedUser = await userManager.signinSilent();
          setSSOAuthData(refreshedUser);
          setSsoState(refreshedUser);
        }
      }
    });

    setSSOAuthData(user);
    setSsoState(user);
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
  const configuration = useAtomValue(configurationAtom);
  const ssoConfig = configuration?.features?.SSO_LOGIN;
  const [ssoState, setSsoState] = useAtom(ssoDataAtom);
  const isSSOEnabled = useIsSSOEnabled();

  useEffect(() => {
    if (
      !isSSOEnabled ||
      !window.isSecureContext ||
      !ssoConfig ||
      getSSOAuthData()?.id_token ||
      ssoState?.id_token
    ) {
      return;
    }

    const startLogin = async () => {
      const bypass = await getEnv(Envs.SSO_LOGIN_BYPASS);
      if (bypass === 'true') return;
      handleSSOLogin(ssoConfig, setSsoState);
    };
    startLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSSOEnabled, ssoConfig]);
}

export function checkForTokenExpiration(token?: string) {
  if (!token) return;

  const timeout = 30; // s
  try {
    const expirationTimestamp = (jwtDecode(token) as JwtPayload).exp!;
    const secondsLeft = expirationTimestamp - Math.floor(Date.now() / 1000);

    if (secondsLeft < timeout) {
      setSSOAuthData(null);
      window.location.reload();
    }
  } catch (_) {
    // ignore errors from non-JWT tokens
  }
}
