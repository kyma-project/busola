import OpenIdConnect from '@luigi-project/plugin-auth-oidc';
import { setAuthData } from './auth-storage';
import {
  getActiveCluster,
  saveActiveClusterName,
} from './../cluster-management';

export let groups;

export function reloadAuth() {
  if (params?.rawAuth) {
    setAuthData(params.rawAuth);
  }
  const params = getActiveCluster();
  const auth = params?.auth && createAuth(params.auth);
  Luigi.setConfig({ ...Luigi.getConfig(), auth });
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
