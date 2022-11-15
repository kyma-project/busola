import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { UserManager } from 'oidc-client-ts';
import { useNavigate } from 'react-router-dom';

import { authDataState } from '../authDataAtom';
import { clusterState } from '../clusterAtom';
import { parseOIDCParams } from './parseOIDCParams';

const hasNonOidcAuth = user => {
  // either token or a pair (client CA, client key) is present
  return (
    user?.token ||
    (user?.['client-certificate-data'] && user?.['client-key-data'])
  );
};

export async function handleAuth(setAuth, cluster, navigate) {
  const kubeconfigUser = cluster?.currentContext?.user?.user;
  // do we need to run the OIDC flow?
  if (hasNonOidcAuth(kubeconfigUser)) {
    setAuth(kubeconfigUser);
    navigate(`/cluster/${cluster.contextName}`);
  } else {
    const { issuerUrl, clientId, clientSecret, scope } = parseOIDCParams(
      kubeconfigUser,
    );

    const oidcSettings = {
      redirect_uri: window.location.origin,
      post_logout_redirect_uri: window.location.origin + '/logout.html',
      loadUserInfo: true,
      automaticSilentRenew: false,
      logoutUrl: window.location.origin + '/logout.html',
      client_id: clientId,
      authority: issuerUrl,
      client_secret: clientSecret,
      scope: scope || 'openid',
      response_type: 'code',
      response_mode: 'search',
    };

    const userManager = new UserManager(oidcSettings);

    const storedAuth = await userManager.getUser();

    if (storedAuth) {
      console.log('token is already here');
      setAuth({ token: storedAuth.id_token });
      userManager.events.addAccessTokenExpiring(async () => {
        const { id_token: token } = await userManager.signinSilent();
        setAuth({ token });
      });
      userManager.events.addSilentRenewError(e => {
        console.warn('silent renew failed', e);
        setAuth(null);
        navigate('/clusters');
      });
      return;
    }

    try {
      // try to receive OIDC response
      const { id_token: token } = await userManager.signinRedirectCallback(
        window.location,
      );
      userManager.events.addAccessTokenExpiring(async () => {
        const { id_token: token } = await userManager.signinSilent();
        setAuth({ token });
      });
      userManager.events.addSilentRenewError(e => {
        console.warn('silent renew failed', e);
        setAuth(null);
      });

      navigate(`/cluster/${cluster.contextName}`);

      // setInterval(() => {
      //   console.log(jwtDecode(token).exp - Date.now() / 1000);
      // }, 5000);

      setAuth({ token });
      return;
    } catch (_) {
      // no response data yet, try to log in
      await userManager.clearStaleState();
      userManager.signinRedirect();
    }
  }
}

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthContext = createContext(null);

async function removeClusterAuth(cluster) {
  const kubeconfigUser = cluster.currentContext.user.user;

  if (hasNonOidcAuth(kubeconfigUser)) return;

  const { issuerUrl, clientId, clientSecret, scope } = parseOIDCParams(
    kubeconfigUser,
  );

  const oidcSettings = {
    redirect_uri: window.location.origin,
    post_logout_redirect_uri: window.location.origin + '/logout.html',
    loadUserInfo: true,
    automaticSilentRenew: false,
    logoutUrl: window.location.origin + '/logout.html',
    client_id: clientId,
    authority: issuerUrl,
    client_secret: clientSecret,
    scope: scope || 'openid',
    response_type: 'code',
    response_mode: 'search',
  };

  const userManager = new UserManager(oidcSettings);
  await userManager.removeUser();
  console.log('user removed');
}

export function AuthContextProvider({ children }) {
  const [auth, setAuth] = useRecoilState(authDataState);
  const currentCluster = useRecoilValue(clusterState);

  const navigate = useNavigate();
  const prevCluster = useRef(null);

  useEffect(() => {
    console.log(
      'cluster changed',
      currentCluster?.cluster?.contextName,
      prevCluster.current,
    );
    (async () => {
      if (prevCluster.current) {
        await removeClusterAuth(prevCluster.current);
      }

      if (currentCluster) {
        await handleAuth(setAuth, currentCluster?.cluster, navigate);
        prevCluster.current = currentCluster?.cluster;
      } else {
        setAuth(null);
        prevCluster.current = null;
        navigate('/clusters');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentCluster?.cluster?.contextName]);

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}
