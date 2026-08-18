import { jwtDecode, JwtPayload } from 'jwt-decode';
import { User, UserManager } from 'oidc-client-ts';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { configurationAtom } from './configuration/configurationAtom';
import { ConfigFeature } from './types';
import { useEffect } from 'react';
import { getEnv, Envs } from 'shared/utils/env';
import { attachSilentRenewHandlers } from './silentRenewSetup';
import { renewingAtom } from './renewingAtom';
import {
  saveIntendedPath,
  toClusterRelative,
  savePendingKubeconfigId,
  consumePendingKubeconfigId,
} from './intendedPathAtom';
import {
  decideOidcCallbackAction,
  OidcErrorParams,
  reportStoppedLogin,
} from './utils/oidcCallbackDecision';
import { useNavigate } from 'react-router';
import { clusterAtom } from './clusterAtom';
import {
  isAuthRedirectLoop,
  registerAuthRedirect,
  resetAuthRedirectGuard,
} from './utils/authRedirectLoopGuard';
import { useNotifyLoginFailure } from './useLoginFailureNotification';

const SSO_KEY = 'SSO';

export type SsoDataState = User | null;

const defaultValue: SsoDataState = getSSOAuthData();

export const ssoDataAtom = atom<SsoDataState>(defaultValue);

// Set to true when the SSO login was stopped (IdP error or redirect loop).
export const ssoLoginStoppedAtom = atom(false);

export function setSSOAuthData(data: SsoDataState) {
  sessionStorage.setItem(SSO_KEY, JSON.stringify(data));
}

export function getSSOAuthData(): SsoDataState {
  return JSON.parse(sessionStorage.getItem(SSO_KEY) || 'null');
}

function hasValidStoredSSOToken(): boolean {
  const stored = getSSOAuthData();
  if (!stored?.id_token) return false;
  // Older payloads have no expires_at; treat them as valid.
  if (typeof stored.expires_at !== 'number') return true;
  return stored.expires_at * 1000 > Date.now();
}

export function useIsSSOEnabled() {
  const configuration = useAtomValue(configurationAtom);
  return configuration?.features?.SSO_LOGIN?.isEnabled ?? false;
}

// Mutable SSO module state, kept in one object.
const session: {
  userManager: UserManager | null;
  handlersAttached: boolean;
  loginInProgress: boolean;
  silentRefreshFn: (() => Promise<User | null>) | null;
  lastTokenCheckTime: number;
} = {
  userManager: null,
  handlersAttached: false,
  loginInProgress: false,
  silentRefreshFn: null,
  lastTokenCheckTime: 0,
};

async function trySilentRefresh(): Promise<boolean> {
  if (!session.userManager || !session.silentRefreshFn) return false;
  const refreshedUser = await session.silentRefreshFn();
  return !!refreshedUser;
}

// Session-drop recovery outside React. Saves the current cluster-relative
// path, then redirects through the IdP; on failure falls back to a full
// load of /clusters. The saved path restores the location afterwards.
function triggerReauthRedirect(userManager: UserManager | null) {
  // Both paths re-enter login after a page load, count them for the loop guard.
  registerAuthRedirect();
  const fullPath = window.location.pathname + window.location.search;
  const relative = toClusterRelative(fullPath);
  if (relative) saveIntendedPath(relative);
  const kubeconfigId = new URLSearchParams(window.location.search).get(
    'kubeconfigID',
  );
  if (kubeconfigId) savePendingKubeconfigId(kubeconfigId);
  if (!userManager) {
    // No manager means handleSSOLogin never ran this page-load (the token
    // was still valid at mount). The stored SSO entry is already cleared,
    // so the full load at /clusters re-enters handleSSOLogin.
    window.location.assign('/clusters');
    return;
  }
  userManager
    .clearStaleState()
    .then(() => userManager.signinRedirect())
    .catch((e: unknown) => {
      console.warn('SSO re-auth redirect failed:', e);
      window.location.assign('/clusters');
    });
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
    // See createUserManager in authDataAtom.ts for the rationale.
    automaticSilentRenew: false,
  });
}

function getOrCreateUserManager(ssoConfig: ConfigFeature): UserManager {
  if (!session.userManager) {
    session.userManager = createSSOUserManager(ssoConfig.config);
  }
  return session.userManager;
}

async function handleSSOLogin(
  ssoConfig: ConfigFeature,
  setSsoState: (user: SsoDataState) => void,
  setRenewing?: (renewing: boolean) => void,
  onLoginFailed?: (failure?: OidcErrorParams) => void,
) {
  if (!ssoConfig || !ssoConfig.config) {
    throw new Error('SSO configuration not found');
  }
  if (session.loginInProgress) return;
  session.loginInProgress = true;
  const userManager = getOrCreateUserManager(ssoConfig);

  try {
    const storedUser = await userManager?.getUser();

    let user: User;
    if (storedUser && !storedUser.expired) {
      user = storedUser;
    } else {
      const decision = decideOidcCallbackAction(ssoConfig.config.clientId);
      if (decision.action === 'foreign-callback') {
        // Callback belongs to another manager (e.g. cluster OIDC); let it run.
        return;
      }
      if (reportStoppedLogin(decision, 'SSO', onLoginFailed)) {
        return;
      }
      if (decision.action === 'redirect') {
        triggerReauthRedirect(userManager);
        return;
      }
      user = await userManager?.signinRedirectCallback(window.location.href);
      // Restore kubeconfigID that was saved before the SSO redirect so
      // useLoginWithKubeconfigID can still find it in the URL.
      const pendingKubeconfigId = consumePendingKubeconfigId();
      if (pendingKubeconfigId) {
        const url = new URL(window.location.href);
        // Remove OAuth callback parameters to prevent re-triggering auth
        url.searchParams.delete('code');
        url.searchParams.delete('iss');
        url.searchParams.delete('state');
        url.searchParams.delete('session_state');
        url.searchParams.set('kubeconfigID', pendingKubeconfigId);
        window.history.replaceState({}, '', url.toString());
        window.location.href = url.toString();
      }
    }

    if (!session.handlersAttached) {
      session.handlersAttached = true;

      const { cleanup, renew } = attachSilentRenewHandlers(userManager, {
        onRenewed: (refreshedUser) => {
          setSSOAuthData(refreshedUser);
          setSsoState(refreshedUser);
        },
        onRenewError: (err) => {
          console.warn('SSO silent renew failed', err);
          setSsoState(null);
          setSSOAuthData(null);
          triggerReauthRedirect(userManager);
        },
        onRenewingChange: setRenewing,
      });
      // Share the same single-flight as the event handlers.
      session.silentRefreshFn = renew;
      userManager.events.addUserUnloaded(() => {
        cleanup();
        session.handlersAttached = false;
        session.silentRefreshFn = null;
        setSsoState(null);
        setSSOAuthData(null);
        // Covers IdP-side session revocation; harmless if onRenewError
        // already started a redirect.
        triggerReauthRedirect(userManager);
      });
    }

    setSSOAuthData(user);
    setSsoState(user);
    resetAuthRedirectGuard();
  } catch (e) {
    // Usually a failed code exchange, IdP error callbacks never get this far.
    console.error('SSO login failed:', e);
    if (isAuthRedirectLoop()) {
      onLoginFailed?.({ error: e instanceof Error ? e.message : String(e) });
    } else {
      triggerReauthRedirect(userManager);
    }
  } finally {
    session.loginInProgress = false;
  }
}

export function useSSOLogin() {
  const configuration = useAtomValue(configurationAtom);
  const ssoConfig = configuration?.features?.SSO_LOGIN;
  const [ssoState, setSsoState] = useAtom(ssoDataAtom);
  const isSSOEnabled = useIsSSOEnabled();
  const setRenewing = useSetAtom(renewingAtom);
  const setSsoLoginStopped = useSetAtom(ssoLoginStoppedAtom);
  const setCluster = useSetAtom(clusterAtom);
  const notifyLoginFailure = useNotifyLoginFailure();
  const navigate = useNavigate();

  useEffect(() => {
    // An expired stored user must fall through so handleSSOLogin can start
    // a new signinRedirect.
    const hasValidLive =
      ssoState?.id_token &&
      (typeof ssoState.expires_at !== 'number' ||
        ssoState.expires_at * 1000 > Date.now());
    if (
      !isSSOEnabled ||
      !window.isSecureContext ||
      !ssoConfig ||
      hasValidLive ||
      hasValidStoredSSOToken()
    ) {
      return;
    }

    const startLogin = async () => {
      const bypass = await getEnv(Envs.SSO_LOGIN_BYPASS);
      if (bypass === 'true') return;
      handleSSOLogin(ssoConfig, setSsoState, setRenewing, (failure) => {
        // Unblock the app behind the dialog, navigating also removes the error params.
        setSsoLoginStopped(true);
        setCluster(null);
        navigate('/clusters', { replace: true });
        notifyLoginFailure(failure, {
          // Retry reloads the page, so SSO login starts again with a clean URL.
          onRetry: () => {
            resetAuthRedirectGuard();
            window.location.assign('/clusters');
          },
        });
      });
    };
    startLogin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSSOEnabled, ssoConfig]);
}

export function checkForTokenExpiration(token?: string) {
  if (!token) return;

  const now = Date.now();
  if (now - session.lastTokenCheckTime < 30000) return;
  session.lastTokenCheckTime = now;

  const timeout = 30; // s
  try {
    const expirationTimestamp = (jwtDecode(token) as JwtPayload).exp!;
    const secondsLeft = expirationTimestamp - Math.floor(Date.now() / 1000);

    if (secondsLeft < timeout) {
      trySilentRefresh().then((ok) => {
        if (!ok) {
          setSSOAuthData(null);
          triggerReauthRedirect(session.userManager);
        }
      });
    }
  } catch (_) {
    // Not a JWT — nothing to check.
  }
}
