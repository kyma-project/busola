import { setAuthData } from './auth-storage';
import {
  getActiveCluster,
  saveActiveClusterName,
} from './../cluster-management/cluster-management';
import { convertToURLsearch } from '../communication';
import { parseOIDCParams } from './oidc-params';
import { getBusolaClusterParams } from '../busola-cluster-params';
import { getSSOAuthData } from './sso';
import { tryRestorePreviousLocation } from '../navigation/previous-location';
import { afterInit } from '../luigi-config';

export let groups;

export function hasNonOidcAuth(user) {
  return (
    user &&
    (user.token || (user['client-certificate-data'] && user['client-key-data']))
  );
}

function updateLuigiAuth(auth) {
  if (!Luigi.getConfig()) {
    throw Error('Cannot updateLuigiAuth, luigi config is not set.');
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

async function importOpenIdConnect() {
  return (await import('@luigi-project/plugin-auth-oidc')).default;
}

export const createAuth = async (callback, kubeconfigUser) => {
  console.log('createAuth 1', hasNonOidcAuth(kubeconfigUser));
  if (hasNonOidcAuth(kubeconfigUser)) {
    await callback();
    return null;
  }
  console.log('createAuth 2', kubeconfigUser?.exec);
  if (!kubeconfigUser?.exec) {
    await callback();
    return null;
  }
  try {
    const { issuerUrl, clientId, scope } = parseOIDCParams(kubeconfigUser);
    const ssoFeature = (await getBusolaClusterParams()).config.features
      .SSO_LOGIN;

    const a = ssoFeature.config.issuerUrl === issuerUrl;
    const b = ssoFeature.config.clientId === clientId;
    const c = ssoFeature.config.scope === scope;

    console.log(a, b, c, getSSOAuthData());
    if (a && b && c && getSSOAuthData()) {
      console.log('kube auth done EARLY');
      setAuthData({ token: getSSOAuthData().idToken });
      await callback();
      return;
    }

    const OpenIdConnect = await importOpenIdConnect();
    console.log('create kube auth');

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
        userInfoFn: async (_, authData) => {
          console.log('kube auth done');
          setAuthData({ token: authData.idToken });
          groups = authData.profile['http://k8s/groups'];

          await callback();
          return Promise.resolve({
            name: authData.profile.name,
            email: authData.profile.email,
          });
        },
        events: {
          onLogout: () => {
            console.log('onLogout');
          },
          onAuthExpired: () => {
            console.log('onAuthExpired');
          },
          onAuthError: (_config, err) => {
            console.log('kube auth err', err);
            saveActiveClusterName(null);
            window.location.href = '/clusters' + convertToURLsearch(err);
            return false; // return false to prevent OIDC plugin navigation
          },
          onAuthSuccessful: (settings, authData) => {
            console.log('kube auth succeecs', settings, authData);
          },
        },
        onLogout: () => {
          console.log('onLogout');
        },
        onAuthExpired: () => {
          console.log('onAuthExpired');
        },
        onAuthError: (_config, err) => {
          console.log('kube auth err', err);
          saveActiveClusterName(null);
          window.location.href = '/clusters' + convertToURLsearch(err);
          return false; // return false to prevent OIDC plugin navigation
        },
        onAuthSuccessful: (settings, authData) => {
          console.log('kube auth succeecs', settings, authData);
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
          console.log('kube auth err', err);
          saveActiveClusterName(null);
          window.location.href = '/clusters' + convertToURLsearch(err);
          return false; // return false to prevent OIDC plugin navigation
        },
        onAuthSuccessful: (settings, authData) => {
          console.log('kube auth succeecs', settings, authData);
        },
      },
      storage: 'none',
    };
  } catch (e) {
    console.warn(e);
    alert('Cannot setup OIDC auth: ' + e.message);
  }
};
