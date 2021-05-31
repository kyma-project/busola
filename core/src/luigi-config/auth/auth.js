import OpenIdConnect from '@luigi-project/plugin-auth-oidc';
import { clearAuthData, setAuthData } from './auth-storage';
import {
  getActiveCluster,
  saveActiveClusterName,
} from './../cluster-management';

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

export function reloadAuth() {
  const params = getActiveCluster();

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
      automaticSilentRenew: true,
      loadUserInfo: false,
      userInfoFn: (_, authData) => {
        // rename received "idToken" to keep consistency with kubeconfig "token"
        authData.token = authData.idToken;
        delete authData.idToken;
        setAuthData(authData);
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
      // TODO: define luigi-client api for getting errors
      onAuthError: err => {
        saveActiveClusterName(null);
        console.log('authErrorHandler 1', err);
      },
    },
    storage: 'none',
  };
};
