import { setAuthData } from './auth-storage';
import {
  getActiveCluster,
  saveActiveClusterName,
} from './../cluster-management/cluster-management';
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
    updateLuigiAuth(createAuth(() => {}, kubeconfigUser));
  }
}

async function importOpenIdConnect() {
  return (await import('@luigi-project/plugin-auth-oidc')).default;
}

async function createAuth(callback, kubeconfigUser) {
  try {
    const { issuerUrl, clientId, clientSecret, scope } = parseOIDCParams(
      kubeconfigUser,
    );

    const OpenIdConnect = await importOpenIdConnect();

    return {
      use: 'openIdConnect',
      openIdConnect: {
        idpProvider: OpenIdConnect,
        authority: issuerUrl,
        client_id: clientId,
        client_secret: clientSecret,
        scope: scope || 'openid',
        response_type: 'code',
        response_mode: 'query',
        userInfoFn: async (_, authData) => {
          setAuthData({ token: authData.idToken });
          groups = authData.profile?.['http://k8s/groups'];

          callback();
          return Promise.resolve({
            name: authData.profile?.name || '',
            email: authData.profile?.email || '',
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
}

export async function clusterLogin(luigiAfterInit) {
  return new Promise(async resolve => {
    const params = await getActiveCluster();

    const kubeconfigUser = params?.currentContext.user.user;

    // don't create auth for non OIDC user
    if (hasNonOidcAuth(kubeconfigUser) || !kubeconfigUser?.exec) {
      setAuthData(kubeconfigUser);
      resolve();
      return;
    }

    // remove SSO data
    Luigi.auth().store.removeAuthData();
    Luigi.unload();

    Luigi.setConfig({
      auth: await createAuth(resolve, kubeconfigUser),
      lifecycleHooks: { luigiAfterInit },
    });
  });
}
