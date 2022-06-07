import { useEffect, useState } from 'react';

import { UserManager } from 'oidc-client-ts';
import jwtDecode from 'jwt-decode';
import { useSelector } from 'react-redux';
import { selectClusters, selectCurrentClusterName } from './clusters.slice';
import { useNavigate } from 'react-router-dom';
import { parseOIDCParams } from './parseOIDCParams';

const STORAGE_KEY = 'busola.auth';
const storage = {
  saveAuth(auth) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
  },
  loadAuth() {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY));
  },
};

async function extractAuth(setAuth, cluster, navigate) {
  // do we need to run the OIDC flow?
  const hasNonOidcAuth = user => {
    // either token or a pair (client CA, client key) is present
    return (
      user?.token ||
      (user?.['client-certificate-data'] && user?.['client-key-data'])
    );
  };

  const kubeconfigUser = cluster.currentContext.user.user;

  if (hasNonOidcAuth(kubeconfigUser)) {
    setAuth(kubeconfigUser);
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

    let storedAuth = storage.loadAuth();
    if (storedAuth && jwtDecode(storedAuth.token).exp * 1000 < Date.now()) {
      storedAuth = null;
      storage.saveAuth(null);
    }

    if (storedAuth) {
      setAuth(storedAuth);
      return;
    }

    const userManager = new UserManager(oidcSettings);

    try {
      // try to receive OIDC response
      const { id_token: token } = await userManager.signinRedirectCallback(
        window.location,
      );
      userManager.events.addAccessTokenExpiring(async () => {
        const { id_token: token } = await userManager.signinSilent();
        setAuth({ token });
        storage.saveAuth({ token });
      });
      userManager.events.addSilentRenewError(e => {
        console.warn('silent renew failed', e);
        setAuth(null);
        storage.saveAuth(null);
      });

      navigate(`/cluster/${cluster.contextName}`);

      // setInterval(() => {
      //   console.log(jwtDecode(token).exp - Date.now() / 1000);
      // }, 5000);

      setAuth({ token });
      storage.saveAuth({ token });
      return;
    } catch (_) {
      // no response data yet, try to log in
      await userManager.clearStaleState();
      userManager.signinRedirect();
    }
  }
}

export function useAuth() {
  const clusters = useSelector(selectClusters);
  const currentClusterName = useSelector(selectCurrentClusterName);
  const navigate = useNavigate();
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    (async () => {
      if (clusters[currentClusterName]) {
        await extractAuth(setAuth, clusters[currentClusterName], navigate);
      } else {
        setAuth(null);
        storage.saveAuth(null);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusters, currentClusterName, setAuth]);

  return auth;
}
