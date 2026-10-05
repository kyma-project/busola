import {
  parseOIDCparams,
  isOIDCExec,
} from 'components/Clusters/components/oidc-params';
import { User, UserManager } from 'oidc-client-ts';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { KubeconfigNonOIDCAuth, KubeconfigOIDCAuth } from 'types';
import { clusterAtom, persistActiveClusterName } from './clusterAtom';
import { getPreviousPath } from './useAfterInitHook';
import {
  getIntendedPath,
  saveIntendedPath,
  toClusterRelative,
} from './intendedPathAtom';
import { openapiLastFetchedAtom } from 'state/openapi/openapiLastFetchedAtom';
import { isEqual } from 'lodash';
import { useNotification } from 'shared/contexts/NotificationContext';
import { attachSilentRenewHandlers } from './silentRenewSetup';
import { useReauthenticate } from './useReauthenticate';
import { renewingAtom } from './renewingAtom';
import {
  decideOidcCallbackAction,
  OidcErrorParams,
  reportStoppedLogin,
} from './utils/oidcCallbackDecision';
import {
  isAuthRedirectLoop,
  registerAuthRedirect,
  resetAuthRedirectGuard,
  resetReauthRedirectClaim,
  tryClaimReauthRedirect,
} from './utils/authRedirectLoopGuard';
import { useNotifyLoginFailure } from './useLoginFailureNotification';
import { ssoDataAtom, ssoLoginStoppedAtom } from './ssoDataAtom';
import { configFeaturesNames } from './types';
import { useFeature } from 'hooks/useFeature';
import { configurationAtom } from './configuration/configurationAtom';

export const hasNonOidcAuth = (
  user?: KubeconfigNonOIDCAuth | KubeconfigOIDCAuth,
) => {
  if (!user) {
    return true;
  }

  if ('token' in user) {
    return !!user.token;
  } else {
    return (
      'client-certificate-data' in user &&
      !!user['client-certificate-data'] &&
      !!user['client-key-data']
    );
  }
};

export type AuthDataState = KubeconfigNonOIDCAuth | null;

type handleLoginProps = {
  userCredentials: KubeconfigOIDCAuth;
  setAuth: (_auth: AuthDataState) => void;
  onAfterLogin: () => void;
  onError: (error: Error) => void;
  onLoginFailed: (failure?: OidcErrorParams) => void;
  onRenewingChange?: (renewing: boolean) => void;
  isCurrent?: () => boolean;
};

// Call cleanup() on cluster change or unmount; silent-renew handlers stack otherwise.
export type HandleLoginResult = {
  userManager: UserManager;
  cleanup: () => void;
};

function getToken(user: User | null, useAccessToken: boolean): string {
  if (!user) {
    throw new Error('user is null');
  }
  if (useAccessToken) {
    return user.access_token;
  }
  if (user.id_token) {
    return user.id_token;
  }
  throw new Error('id_token is empty');
}

export function createUserManager(
  oidcParams: {
    issuerUrl: string;
    clientId: string;
    clientSecret: string;
    scopes: string[];
  },
  redirectPath = '',
) {
  const uniqueScopes = new Set(oidcParams.scopes || []);
  uniqueScopes.delete('openid');

  return new UserManager({
    redirect_uri: window.location.origin + redirectPath,
    post_logout_redirect_uri: window.location.origin + '/logout.html',
    loadUserInfo: false,
    client_id: oidcParams.clientId,
    authority: oidcParams.issuerUrl,
    client_secret: oidcParams.clientSecret,
    scope: `openid ${[...uniqueScopes].join(' ')}`,
    response_type: 'code',
    response_mode: 'query',
    // Two racing signinSilent() calls consume a rotating refresh token; the second gets invalid_grant.
    automaticSilentRenew: false,
  });
}

async function handleLogin({
  userCredentials,
  setAuth,
  onAfterLogin,
  onError,
  onLoginFailed,
  onRenewingChange,
  isCurrent,
}: handleLoginProps): Promise<HandleLoginResult | null> {
  const oidcParams = parseOIDCparams(userCredentials);
  const userManager = createUserManager(oidcParams);

  const useAccessToken: boolean = oidcParams?.useAccessToken ?? false;

  try {
    const storedUser = await userManager.getUser();

    let user: User;
    const validStoredUser =
      storedUser && !storedUser.expired ? storedUser : null;
    const decision = decideOidcCallbackAction(oidcParams.clientId);
    if (validStoredUser && decision.action === 'process-callback') {
      // The new login must win: the old session can't renew and would redirect again.
      user = await userManager
        .signinRedirectCallback(window.location.href)
        .catch((e) => {
          console.warn('Login callback failed, keeping the stored user:', e);
          return validStoredUser;
        });
    } else if (validStoredUser) {
      user = validStoredUser;
    } else {
      if (decision.action === 'foreign-callback') {
        // Callback belongs to another manager (e.g. SSO); let it run.
        return null;
      }
      if (reportStoppedLogin(decision, 'Cluster', onLoginFailed)) {
        return null;
      }
      if (decision.action === 'redirect') {
        if (tryClaimReauthRedirect()) {
          registerAuthRedirect();
          await userManager.clearStaleState();
          await userManager.signinRedirect();
        }
        return null;
      }
      user = await userManager.signinRedirectCallback(window.location.href);
    }

    if (isCurrent && !isCurrent()) return null;

    setAuth({ token: getToken(user, useAccessToken) });
    const { cleanup } = attachSilentRenewHandlers(userManager, {
      onRenewed: (renewedUser) => {
        // A late renew from a superseded cluster must not overwrite current cluster's authData.
        if (isCurrent && !isCurrent()) return;
        setAuth({ token: getToken(renewedUser, useAccessToken) });
      },
      onRenewError: (e) => {
        if (isCurrent && !isCurrent()) return;
        setAuth(null);
        onError(e);
      },
      // App-global counter; call even if this cluster was superseded mid-renew.
      onRenewingChange,
    });
    onAfterLogin();
    return { userManager, cleanup };
  } catch (e) {
    if (e instanceof Error) {
      // 'No state in response' = no login was in progress; 'authority mismatch' = stale storage from a prior issuer.
      if (
        (e.message.includes('No state in response') ||
          e.message.includes('authority mismatch')) &&
        !isAuthRedirectLoop()
      ) {
        if (tryClaimReauthRedirect()) {
          try {
            registerAuthRedirect();
            await userManager.clearStaleState();
            await userManager.signinRedirect();
          } catch (redirectError) {
            console.warn('Login restart failed:', redirectError);
            // Still on this page, so let onError redirect.
            resetReauthRedirectClaim();
            onError(
              redirectError instanceof Error
                ? redirectError
                : new Error(String(redirectError)),
            );
          }
        }
      } else {
        console.error('Cluster login failed:', e);
        onLoginFailed({ error: e.message });
      }
    } else {
      throw e;
    }
    return null;
  }
}

export function useAuthHandler() {
  const notification = useNotification();
  const [cluster, setCluster] = useAtom(clusterAtom);
  const setAuth = useSetAtom(authDataAtom);
  const navigate = useNavigate();
  const setLastFetched = useSetAtom(openapiLastFetchedAtom);
  const [isLoading, setIsLoading] = useState(true);
  const prevClusterRef = useRef<typeof cluster>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const userManagerRef = useRef<UserManager | null>(null);
  // Stale handleLogin resolutions clean up instead of overwriting refs.
  const loginGenRef = useRef(0);
  const setRenewing = useSetAtom(renewingAtom);
  const reauth = useReauthenticate({ notifyError: notification.notifyError });
  const notifyLoginFailure = useNotifyLoginFailure();
  const ssoData = useAtomValue(ssoDataAtom);
  const ssoLoginStopped = useAtomValue(ssoLoginStoppedAtom);
  const isSSOEnabled = useFeature(configFeaturesNames.SSO_LOGIN)?.isEnabled;
  const configuration = useAtomValue(configurationAtom);

  useEffect(() => {
    if (!configuration?.features) return;
    if (!ssoData && isSSOEnabled && !ssoLoginStopped) return;
    // A configuration reload re-runs this effect; an unchanged cluster keeps its handlers.
    if (cluster && isEqual(prevClusterRef.current, cluster)) return;
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
      userManagerRef.current = null;
      authUserManagerRef.current = null;
    }
    const gen = ++loginGenRef.current;

    if (!cluster) {
      prevClusterRef.current = null;
      setAuth(null);
      setIsLoading(false);
    } else {
      prevClusterRef.current = cluster;

      const userCredentials = cluster.currentContext?.user?.user;

      const genericExec =
        !hasNonOidcAuth(userCredentials) &&
        !isOIDCExec((userCredentials as KubeconfigOIDCAuth)?.exec);

      if (hasNonOidcAuth(userCredentials)) {
        setAuth(userCredentials as KubeconfigNonOIDCAuth);
        setIsLoading(false);
      } else if (genericExec) {
        // Generic exec plugins can't run in the browser; send the user back
        // to the cluster list so they can supply a token manually.
        console.warn(
          'Cluster uses a generic exec plugin with no token. Please edit the cluster and provide a token.',
        );
        navigate('/clusters');
        setIsLoading(false);
      } else {
        const onAfterLogin = () => {
          setIsLoading(false);

          // Auto-navigate only after an OIDC callback (always lands on '/').
          const isOidcCallbackPath = window.location.pathname === '/';
          if (
            isOidcCallbackPath &&
            (!getPreviousPath() || getPreviousPath() === '/clusters')
          ) {
            if (cluster.currentContext.namespace) {
              navigate(
                `/cluster/${encodeURIComponent(cluster.name)}/namespaces/${
                  cluster.currentContext.namespace
                }`,
              );
            } else {
              navigate('/cluster/' + encodeURIComponent(cluster.name));
            }
          }
        };

        const onError = (error?: Error) => {
          setIsLoading(false);
          console.warn('Silent token renew failed:', error);
          reauth(userManagerRef.current, error);
        };

        const onLoginFailed = (failure?: OidcErrorParams) => {
          if (gen !== loginGenRef.current) return;
          setIsLoading(false);
          setAuth(null);
          // Clear the cluster so picking it again (or Retry) starts a new login.
          setCluster(null);
          // Still on this page, so let a later retry redirect.
          resetReauthRedirectClaim();
          const relative = toClusterRelative(
            window.location.pathname + window.location.search,
          );
          // Keep the kubeconfigID of a pending deep link, or the path is restored on the wrong cluster.
          const kubeconfigId = getIntendedPath()?.kubeconfigId;
          notifyLoginFailure(failure, {
            // prompt: 'login' so a stale IdP session can't send us straight back into the loop.
            // handleLogin returned no manager, so create one from the cluster's OIDC settings.
            onRetry: () => {
              // Saved on Retry only; after Close it would be restored on the next cluster opened.
              if (relative) saveIntendedPath(relative, kubeconfigId);
              resetAuthRedirectGuard();
              // The cluster was cleared above; store its name so the login callback can restore it.
              persistActiveClusterName(cluster.name);
              const userManager = createUserManager(
                parseOIDCparams(userCredentials as KubeconfigOIDCAuth),
              );
              userManager
                .clearStaleState()
                .then(() => userManager.signinRedirect({ prompt: 'login' }))
                .catch(() =>
                  navigate(`/cluster/${encodeURIComponent(cluster.name)}`),
                );
            },
          });
          navigate('/clusters');
        };

        handleLogin({
          userCredentials: userCredentials as KubeconfigOIDCAuth,
          setAuth,
          onAfterLogin,
          onError,
          onLoginFailed,
          onRenewingChange: setRenewing,
          isCurrent: () => gen === loginGenRef.current,
        }).then((result) => {
          if (!result) return;
          if (gen !== loginGenRef.current) {
            // A newer cluster took over while we were awaiting; discard this one.
            result.cleanup();
            return;
          }
          userManagerRef.current = result.userManager;
          authUserManagerRef.current = result.userManager;
          cleanupRef.current = result.cleanup;
        });
      }
    }
    setLastFetched(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster, ssoData, ssoLoginStopped, isSSOEnabled, configuration]);

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
        userManagerRef.current = null;
        authUserManagerRef.current = null;
      }
    };
  }, []);

  return { isLoading };
}

export const authDataAtom = atom<AuthDataState>(null);
authDataAtom.debugLabel = 'authDataAtom';

// Shared so useResourceSchemas can call useReauthenticate without re-parsing the kubeconfig.
export const authUserManagerRef: { current: UserManager | null } = {
  current: null,
};
