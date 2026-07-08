import { jwtDecode, JwtPayload } from 'jwt-decode';
import { User, UserManager } from 'oidc-client-ts';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { configurationAtom } from './configuration/configurationAtom';
import { ConfigFeature } from './types';
import { useEffect } from 'react';
import { getEnv, Envs } from 'shared/utils/env';
import { attachSilentRenewHandlers } from './silentRenewSetup';
import { renewingAtom } from './renewingAtom';
import { saveIntendedPath } from './intendedPathAtom';

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

let userManager: UserManager | null = null;
let handlersAttached = false;
let loginInProgress = false;
let registeredSsoStateSetter: ((user: SsoDataState) => void) | null = null;
let silentRefreshFn: (() => Promise<User | null>) | null = null;
let lastTokenCheckTime = 0;

// Thin adapter around `attachSilentRenewHandlers` for the SSO manager.
export function attachSSOSilentRenew(
  um: UserManager,
  {
    onRenewed,
    onRenewError,
    onRenewingChange,
  }: {
    onRenewed: (u: User) => void;
    onRenewError: (e: Error) => void;
    onRenewingChange?: (renewing: boolean) => void;
  },
) {
  return attachSilentRenewHandlers(um, {
    onRenewed,
    onRenewError,
    onRenewingChange,
  });
}

async function trySilentRefresh(): Promise<boolean> {
  if (!userManager || !silentRefreshFn) return false;
  try {
    const refreshedUser = await silentRefreshFn();
    if (refreshedUser) return true;
    setSSOAuthData(null);
    registeredSsoStateSetter?.(null);
    return false;
  } catch {
    setSSOAuthData(null);
    registeredSsoStateSetter?.(null);
    return false;
  }
}

// See authDataAtom.ts:isOwnOidcCallback — same pattern for the SSO manager.
function isOwnOidcCallback(clientId: string): boolean {
  const stateId = new URLSearchParams(window.location.search).get('state');
  if (!stateId) return false;
  try {
    const raw = localStorage.getItem(`oidc.${stateId}`);
    if (!raw) return false;
    return JSON.parse(raw)?.client_id === clientId;
  } catch {
    return false;
  }
}

export function createSSOUserManager(oidcConfig: {
  issuerUrl: string;
  clientId: string;
  scope?: string;
}): UserManager {
  return new UserManager({
    redirect_uri: window.location.origin,
    post_logout_redirect_uri: window.location.origin + '/logout.html',
    loadUserInfo: false,
    client_id: oidcConfig.clientId,
    authority: oidcConfig.issuerUrl,
    scope: oidcConfig.scope || 'openid',
    response_type: 'code',
    response_mode: 'query',
    // See authDataAtom.ts — same rationale for disabling the library timer.
    automaticSilentRenew: false,
  });
}

function getOrCreateUserManager(ssoConfig: ConfigFeature): UserManager {
  if (!userManager) {
    userManager = createSSOUserManager(ssoConfig.config);
  }
  return userManager;
}

async function handleSSOLogin(
  ssoConfig: ConfigFeature,
  setSsoState: (user: SsoDataState) => void,
  setRenewing?: (renewing: boolean) => void,
) {
  if (!ssoConfig || !ssoConfig.config) {
    throw new Error('SSO configuration not found');
  }
  if (loginInProgress) return;
  loginInProgress = true;
  const userManager = getOrCreateUserManager(ssoConfig);
  registeredSsoStateSetter = setSsoState;

  try {
    const storedUser = await userManager?.getUser();

    let user: User;
    if (storedUser && !storedUser.expired) {
      user = storedUser;
    } else {
      const hasCode = new URLSearchParams(window.location.search).has('code');
      if (hasCode && !isOwnOidcCallback(ssoConfig.config.clientId)) {
        // Callback in progress but not ours (e.g. cluster OIDC's); let it run.
        return;
      }
      if (!hasCode) {
        await userManager.clearStaleState();
        userManager.signinRedirect();
        return;
      }
      user = await userManager?.signinRedirectCallback(window.location.href);
    }

    if (!handlersAttached) {
      handlersAttached = true;
      silentRefreshFn = () => userManager.signinSilent();

      const detach = attachSSOSilentRenew(userManager, {
        onRenewed: (refreshedUser) => {
          setSSOAuthData(refreshedUser);
          setSsoState(refreshedUser);
        },
        onRenewError: (err) => {
          console.warn('silent renew failed', err);
          setSsoState(null);
          setSSOAuthData(null);
        },
        onRenewingChange: setRenewing,
      });
      userManager.events.addUserUnloaded(() => {
        detach();
        handlersAttached = false;
        silentRefreshFn = null;
      });
    }

    setSSOAuthData(user);
    setSsoState(user);
  } catch {
    const params = new URLSearchParams(window.location.search);
    if (params.has('error')) {
      console.error(
        'SSO error from IdP:',
        params.get('error'),
        params.get('error_description'),
      );
      return;
    }
    await userManager.clearStaleState();
    userManager.signinRedirect();
  } finally {
    loginInProgress = false;
  }
}

export function useSSOLogin() {
  const configuration = useAtomValue(configurationAtom);
  const ssoConfig = configuration?.features?.SSO_LOGIN;
  const [ssoState, setSsoState] = useAtom(ssoDataAtom);
  const isSSOEnabled = useIsSSOEnabled();
  const setRenewing = useSetAtom(renewingAtom);

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
      handleSSOLogin(ssoConfig, setSsoState, setRenewing);
    };
    startLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSSOEnabled, ssoConfig]);
}

export function checkForTokenExpiration(token?: string) {
  if (!token) return;

  const now = Date.now();
  if (now - lastTokenCheckTime < 30000) return;
  lastTokenCheckTime = now;

  const timeout = 30; // s
  try {
    const expirationTimestamp = (jwtDecode(token) as JwtPayload).exp!;
    const secondsLeft = expirationTimestamp - Math.floor(Date.now() / 1000);

    if (secondsLeft < timeout) {
      trySilentRefresh().then((ok) => {
        if (!ok) {
          setSSOAuthData(null);
          // Silent refresh failed; preserve location and round-trip through
          // the IdP (consumed on return by useIntendedPathRestore).
          const currentPath = window.location.pathname + window.location.search;
          saveIntendedPath(currentPath);
          userManager?.signinRedirect().catch((e) => {
            console.warn('SSO re-auth redirect failed:', e);
          });
        }
      });
    }
  } catch (_) {
    // non-JWT token — nothing to check
  }
}
