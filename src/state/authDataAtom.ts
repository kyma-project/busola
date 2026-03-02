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
  });
}

async function handleLogin({
  userCredentials,
  setAuth,
  onAfterLogin,
  onError,
}: handleLoginProps): Promise<void> {
  const setupAuthEventsHooks = (
    userManager: UserManager,
    useAccessToken: boolean,
  ) => {
    userManager.events.addAccessTokenExpiring(async () => {
      const user = await userManager.signinSilent();
      setAuth({
        token: getToken(user, useAccessToken),
      });
    });
    userManager.events.addSilentRenewError((e) => {
      console.warn('silent renew failed', e);
      setAuth(null);
      onError(e);
    });
  };

  const setupVisibilityEventsHooks = (
    userManager: UserManager,
    user: User | null,
    useAccessToken: boolean,
  ) => {
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        if (!!user?.expired || (user?.expires_in && user?.expires_in <= 5)) {
          try {
            user = await userManager.signinSilent();
            setAuth({
              token: getToken(user, useAccessToken),
            });
          } catch (e) {
            console.warn('Visibility silent renew failed: ', e);
            setAuth(null);
            onError(e instanceof Error ? e : new Error(String(e)));
          }
        }
      }
    });
  };

  const oidcParams = parseOIDCparams(userCredentials);
  const userManager = createUserManager(oidcParams);

  const useAccessToken: boolean = oidcParams?.useAccessToken ?? false;

  try {
    const storedUser = await userManager.getUser();
    const user =
      storedUser && !storedUser.expired
        ? storedUser
        : await userManager.signinRedirectCallback(window.location.href);
    setAuth({ token: getToken(user, useAccessToken) });
    setupAuthEventsHooks(userManager, useAccessToken);
    setupVisibilityEventsHooks(userManager, user, useAccessToken);
    onAfterLogin();
  } catch (e) {
    // ignore 'No state in response' error - it means we didn't fire login request yet
    if (e instanceof Error)
      if (!e.message.includes('No state in response')) {
        alert('Login error: ' + e);
      } else {
        // no response data yet, try to log in
        await userManager.clearStaleState();
        userManager.signinRedirect();
      }
    else {
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

  useEffect(() => {
    if (!cluster) {
      setAuth(null);
      setIsLoading(false);
    } else {
      if (isEqual(prevClusterRef.current, cluster)) return; // Skip if unchanged

      const userCredentials = cluster.currentContext?.user?.user;

      const genericExec =
        !hasNonOidcAuth(userCredentials) &&
        !isOIDCExec((userCredentials as KubeconfigOIDCAuth)?.exec);

      if (hasNonOidcAuth(userCredentials)) {
        setAuth(userCredentials as KubeconfigNonOIDCAuth);
        setIsLoading(false);
      } else if (genericExec) {
        // Generic exec plugin — cannot be run in the browser and no token was
        // provided. Redirect back to the cluster list so the user can supply one.
        console.warn(
          'Cluster uses a generic exec plugin with no token. Please edit the cluster and provide a token.',
        );
        navigate('/clusters');
        setIsLoading(false);
      } else {
        const onAfterLogin = () => {
          setIsLoading(false);

          // Only auto-navigate after an OIDC redirect (which always lands on '/').
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
          navigate('/clusters');
          setIsLoading(false);

          console.warn('Silent token renew failed:', error);

          const errorMessage =
            error?.message || t('common.errors.session-expired');

          notification.notifyError({
            content: `${t('common.errors.session-not-renewed')} ${errorMessage}`,
          });
        };

        handleLogin({
          userCredentials: userCredentials as KubeconfigOIDCAuth,
          setAuth,
          onAfterLogin,
          onError,
        });
      }
    }
    setLastFetched(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cluster]);

  return { isLoading };
}

export const authDataAtom = atom<AuthDataState>(null);
authDataAtom.debugLabel = 'authDataAtom';
