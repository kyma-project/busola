import OpenIdConnect from '@luigi-project/plugin-auth-oidc';
import { setAuthData } from './auth-storage';
import {
  getActiveCluster,
  saveActiveClusterName,
} from './../cluster-management';
import { convertToURLsearch } from '../communication';

export let groups;

export function hasKubeconfigAuth(user) {
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

  if (!params) return;

  const kubeconfigUser = params.currentContext.user.user;

  if (hasKubeconfigAuth(kubeconfigUser)) {
    // auth is already in kubeconfig
    setAuthData(kubeconfigUser);
    updateLuigiAuth(null);
  } else {
    // we need to use OIDC flow
    updateLuigiAuth(createAuth(params.config.auth));
  }
}

export const createAuth = authParams => {
  if (!authParams) {
    return null;
  }

  const { issuerUrl, clientId, responseType, responseMode, scope } = authParams;

  return {
    use: 'openIdConnect',
    openIdConnect: {
      idpProvider: OpenIdConnect,
      authority: issuerUrl,
      client_id: clientId,
      scope: scope || 'openid',
      response_type: responseType,
      response_mode: responseMode,
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
};
