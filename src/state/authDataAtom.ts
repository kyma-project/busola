import {
  parseOIDCparams,
  isOIDCExec,
} from 'components/Clusters/components/oidc-params';
import { User, UserManager } from 'oidc-client-ts';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { KubeconfigNonOIDCAuth, KubeconfigOIDCAuth } from 'types';
import { clusterAtom } from './clusterAtom';
import { getPreviousPath } from './useAfterInitHook';
import { openapiLastFetchedAtom } from 'state/openapi/openapiLastFetchedAtom';
import { isEqual } from 'lodash';
import { useNotification } from 'shared/contexts/NotificationContext';
import { useTranslation } from 'react-i18next';
import { attachSilentRenewHandlers } from './silentRenewSetup';
import { useReauthenticate } from './useReauthenticate';
import { renewingAtom } from './renewingAtom';

export const hasNonOidcAuth = (
  user?: KubeconfigNonOIDCAuth | KubeconfigOIDCAuth,
) => {
  if (!user) {
    return true;
  }

  // either token or a pair (client CA, client key) is present
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
  onRenewingChange?: (renewing: boolean) => void;
  // Returns false if a newer cluster has taken over — abort side-effects.
  isCurrent?: () => boolean;
};

// Returned so callers can detach the silent-renew listeners on cluster change
// or unmount — otherwise handlers stack and fire multiple times per event.
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

// Checks the pending signin state (`oidc.<stateId>` in sessionStorage) to see
// whether this callback URL belongs to this UserManager. More reliable than
// matching on the `iss` param, which some IdPs omit.
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
    // Disable the library's built-in silent renewal so our custom handler is
    // the only signinSilent() call in flight — two racing calls consume the
    // rotating refresh token and the second returns invalid_grant.
    automaticSilentRenew: false,
  });
}

async function handleLogin({
  userCredentials,
  setAuth,
  onAfterLogin,
  onError,
  onRenewingChange,
  isCurrent,
}: handleLoginProps): Promise<HandleLoginResult | void> {
  const oidcParams = parseOIDCparams(userCredentials);
  const userManager = createUserManager(oidcParams);

  const useAccessToken: boolean = oidcParams?.useAccessToken ?? false;

  try {
    const storedUser = await userManager.getUser();

    let user: User;
    if (storedUser && !storedUser.expired) {
      user = storedUser;
    } else {
      const hasCode = new URLSearchParams(window.location.search).has('code');
      if (hasCode && !isOwnOidcCallback(oidcParams.clientId)) {
        // Callback in progress but not ours (e.g. SSO's); let its handler run.
        return;
      }
      if (!hasCode) {
        await userManager.clearStaleState();
        await userManager.signinRedirect();
        return;
      }
      user = await userManager.signinRedirectCallback(window.location.href);
    }

    if (isCurrent && !isCurrent()) return;

    setAuth({ token: getToken(user, useAccessToken) });
    const cleanup = attachSilentRenewHandlers(userManager, {
      onRenewed: (renewedUser) => {
        setAuth({ token: getToken(renewedUser, useAccessToken) });
      },
      onRenewError: (e) => {
        setAuth(null);
        onError(e);
      },
      onRenewingChange,
    });
    onAfterLogin();
    return { userManager, cleanup };
  } catch (e) {
    if (e instanceof Error) {
      // 'No state in response' = no login in progress; 'authority mismatch' =
      // stale storage from a prior issuer. Both recover by starting fresh.
      if (
        e.message.includes('No state in response') ||
        e.message.includes('authority mismatch')
      ) {
        await userManager.clearStaleState();
        userManager.signinRedirect();
      } else {
        alert('Login error: ' + e);
      }
    } else {
      throw e;
    }
  }
}

export function useAuthHandler() {
  const { t } = useTranslation();
  const notification = useNotification();
  const cluster = useAtomValue(clusterAtom);
  const setAuth = useSetAtom(authDataAtom);
  const navigate = useNavigate();
  const setLastFetched = useSetAtom(openapiLastFetchedAtom);
  const [isLoading, setIsLoading] = useState(true);
  const prevClusterRef = useRef<typeof cluster>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const userManagerRef = useRef<UserManager | null>(null);
  // Bumped on every cluster-change; late handleLogin resolutions with a
  // stale generation self-clean instead of overwriting the current refs.
  const loginGenRef = useRef(0);
  const setRenewing = useSetAtom(renewingAtom);
  const reauth = useReauthenticate({ notifyError: notification.notifyError });

  useEffect(() => {
    // Detach previous cluster's silent-renew listeners before switching.
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
      userManagerRef.current = null;
      authUserManagerRef.current = null;
    }
    const gen = ++loginGenRef.current;

    if (!cluster) {
      setAuth(null);
      setIsLoading(false);
    } else {
      if (isEqual(prevClusterRef.current, cluster)) return;
      prevClusterRef.current = cluster;

      const userCredentials = cluster.currentContext?.user?.user;

      const genericExec =
        !hasNonOidcAuth(userCredentials) &&
        !isOIDCExec((userCredentials as KubeconfigOIDCAuth)?.exec);

      if (hasNonOidcAuth(userCredentials)) {
        setAuth(userCredentials as KubeconfigNonOIDCAuth);
        setIsLoading(false);
      } else if (genericExec) {
        // Generic exec plugins can't run in the browser; bounce to the list
        // so the user can supply a token.
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
          const um = userManagerRef.current;
          if (um) {
            reauth(um, error);
          } else {
            // No manager yet — no IdP round-trip possible; surface the error.
            navigate('/clusters');
            const errorMessage =
              error?.message || t('common.errors.session-expired');
            notification.notifyError({
              content: `${t('common.errors.session-not-renewed')} ${errorMessage}`,
            });
          }
        };

        handleLogin({
          userCredentials: userCredentials as KubeconfigOIDCAuth,
          setAuth,
          onAfterLogin,
          onError,
          onRenewingChange: setRenewing,
          isCurrent: () => gen === loginGenRef.current,
        }).then((result) => {
          if (!result) return;
          if (gen !== loginGenRef.current) {
            // A newer cluster took over while we were awaiting; discard.
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
  }, [cluster]);

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

// Module-scoped mirror of `useAuthHandler`'s current UserManager, so
// `useResourceSchemas` can trigger `useReauthenticate` without re-parsing the
// kubeconfig. Updated on cluster change, cleared on unmount.
export const authUserManagerRef: { current: UserManager | null } = {
  current: null,
};
