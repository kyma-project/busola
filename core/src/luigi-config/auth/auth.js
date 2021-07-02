import OpenIdConnect from '@luigi-project/plugin-auth-oidc';
import { setAuthData } from './auth-storage';
import {
  getActiveCluster,
  saveActiveClusterName,
} from './../cluster-management';
import { convertToURLsearch } from '../communication';
import { parseOIDCParams } from './oidc-params';

export let groups;

export function hasNonOidcAuth(user) {
  return (
    user &&
    (user.token || (user['client-certificate-data'] && user['client-key-data']))
  );
}

function updateLuigiAuth(auth) {
  if (!Luigi.getConfig()) {
    throw Error('Cannot updateLuigiAuth, Luigi config is not set.');
  }
  Luigi.getConfig().auth = auth;
  Luigi.configChanged();
}

export async function reloadAuth() {
  const params = await getActiveCluster();

  if (!params) {
    updateLuigiAuth(null);
    return;
  }

  const kubeconfigUser = params.currentContext.user.user;

  if (hasNonOidcAuth(kubeconfigUser)) {
    // auth is already in kubeconfig
    setAuthData(kubeconfigUser);
    updateLuigiAuth(null);
  } else {
    // we need to use OIDC flow
    updateLuigiAuth(createAuth(kubeconfigUser));
  }
}

export const createAuth = kubeconfigUser => {
  if (hasNonOidcAuth(kubeconfigUser)) {
    return null;
  }
  if (!kubeconfigUser?.exec) {
    return null;
  }

  try {
    const { issuerUrl, clientId, scope } = parseOIDCParams(kubeconfigUser);

    return {
      use: 'openIdConnect',
      openIdConnect: {
        idpProvider: OpenIdConnect,
        authority: issuerUrl,
        client_id: clientId,
        scope: scope || 'openid',
        response_type: 'code',
        response_mode: 'query',
        loadUserInfo: false,
        userInfoFn: (_, authData) => {
          // rename received "idToken" to keep consistency with kubeconfig "token"
          setAuthData({ token: authData.idToken });
          groups = authData.profile['http://k8s/groups'];
          return Promise.resolve({
            name: authData.profile.name,
            email: authData.profile.email,
          });
        },
      },

      events: {
        onLogout: () => {
          console.log('onLogout');
        },
        onAuthExpired: () => {
          console.log('onAuthExpired');
        },
        onAuthError: (_config, err) => {
          saveActiveClusterName(null);
          window.location.href = '/clusters' + convertToURLsearch(err);
          return false; // return false to prevent OIDC plugin navigation
        },
      },
      storage: 'none',
    };
  } catch (e) {
    console.warn(e);
    alert('Cannot setup OIDC auth: ' + e.message);
  }
};
