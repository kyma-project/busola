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
import { attachSilentRenewHandlers } from './silentRenewSetup';
import { useReauthenticate } from './useReauthenticate';
import { renewingAtom } from './renewingAtom';
import { isOwnOidcCallback } from './utils/isOwnOidcCallback';

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
  // Returns false if a newer cluster has taken over; caller should abort.
  isCurrent?: () => boolean;
};

// Returned so callers can detach the silent-renew listeners on cluster change
// or unmount; without cleanup the handlers stack across cluster switches.
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
    // Disable the library's built-in silent renewal so our custom handler is
    // the only signinSilent() call in flight. Two racing calls consume the
    // rotating refresh token and the second one gets invalid_grant.
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
}: handleLoginProps): Promise<HandleLoginResult | null> {
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
        // Callback belongs to another manager (e.g. SSO); let it run.
        return null;
      }
      if (!hasCode) {
        await userManager.clearStaleState();
        await userManager.signinRedirect();
        return null;
      }
      user = await userManager.signinRedirectCallback(window.location.href);
    }

    if (isCurrent && !isCurrent()) return null;

    setAuth({ token: getToken(user, useAccessToken) });
    const { cleanup } = attachSilentRenewHandlers(userManager, {
      onRenewed: (renewedUser) => {
        // A late renew from a superseded cluster must not overwrite the
        // current cluster's authData.
        if (isCurrent && !isCurrent()) return;
        setAuth({ token: getToken(renewedUser, useAccessToken) });
      },
      onRenewError: (e) => {
        if (isCurrent && !isCurrent()) return;
        setAuth(null);
        onError(e);
      },
      // App-global counter; must be balanced even if this cluster was
      // superseded mid-renew.
      onRenewingChange,
    });
    onAfterLogin();
    return { userManager, cleanup };
  } catch (e) {
    if (e instanceof Error) {
      // 'No state in response' means no login was in progress; 'authority
      // mismatch' means stale storage from a prior issuer. Both recover
      // by starting fresh.
      if (
        e.message.includes('No state in response') ||
        e.message.includes('authority mismatch')
      ) {
        try {
          await userManager.clearStaleState();
          await userManager.signinRedirect();
        } catch (redirectError) {
          console.warn('Login restart failed:', redirectError);
          onError(
            redirectError instanceof Error
              ? redirectError
              : new Error(String(redirectError)),
          );
        }
      } else {
        alert('Login error: ' + e);
      }
    } else {
      throw e;
    }
    return null;
  }
}

export function useAuthHandler() {
  const notification = useNotification();
  const cluster = useAtomValue(clusterAtom);
  const setAuth = useSetAtom(authDataAtom);
  const navigate = useNavigate();
  const setLastFetched = useSetAtom(openapiLastFetchedAtom);
  const [isLoading, setIsLoading] = useState(true);
  const prevClusterRef = useRef<typeof cluster>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const userManagerRef = useRef<UserManager | null>(null);
  // Bumped on every cluster change; a late `handleLogin` resolution with an
  // outdated generation cleans itself up instead of overwriting the refs.
  const loginGenRef = useRef(0);
  const setRenewing = useSetAtom(renewingAtom);
  const reauth = useReauthenticate({ notifyError: notification.notifyError });

  useEffect(() => {
    // Detach the previous cluster's silent-renew listeners before switching.
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

// Module-scoped mirror of `useAuthHandler`'s current UserManager so
// `useResourceSchemas` can invoke `useReauthenticate` without re-parsing
// the kubeconfig. Set on cluster change, cleared on unmount.
export const authUserManagerRef: { current: UserManager | null } = {
  current: null,
};
