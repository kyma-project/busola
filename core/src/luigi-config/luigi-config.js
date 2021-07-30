import i18next from 'i18next';
import i18nextBackend from 'i18next-http-backend';
import yaml from 'js-yaml';

import {
  saveCurrentLocation,
  tryRestorePreviousLocation,
} from './navigation/previous-location';
import { getAuthData, setAuthData } from './auth/auth-storage';
import { communication } from './communication';
import { createSettings } from './settings';
import { createAuth, hasNonOidcAuth } from './auth/auth.js';
import { saveQueryParamsIfPresent } from './init-params/init-params.js';
import {
  getActiveCluster,
  handleResetEndpoint,
  setActiveClusterIfPresentInUrl,
} from './cluster-management';
import { loadHiddenNamespacesToggle } from './utils/hidden-namespaces-toggle';

import {
  createNavigation,
  addClusterNodes,
} from './navigation/navigation-data-init';
import { setTheme, getTheme } from './utils/theme';

export const i18n = i18next.use(i18nextBackend).init({
  lng: localStorage.getItem('busola.language') || 'en',
  fallbackLng: 'en',
  backend: {
    loadPath: '/i18n/{{lng}}.yaml',
    parse: data => yaml.load(data),
  },
});

export const NODE_PARAM_PREFIX = `~`;

async function luigiAfterInit() {
  Luigi.ux().hideAppLoadingIndicator();

  const params = await getActiveCluster();
  const isClusterChoosen = !!params;

  // save location, as we'll be logged out in a moment
  if (!getAuthData()) {
    saveCurrentLocation();
    return;
  }

  loadHiddenNamespacesToggle();

  if (!isClusterChoosen) {
    if (!window.location.pathname.startsWith('/clusters')) {
      Luigi.navigation().navigate('/clusters');
    }
  } else {
    try {
      if (getAuthData() && !hasNonOidcAuth(params.currentContext?.user?.user)) {
        await addClusterNodes();
      }
    } catch (e) {
      console.warn(e);
      Luigi.ux().showAlert({
        text: 'Cannot load navigation nodes',
        type: 'error',
      });
    }
    tryRestorePreviousLocation();
  }
}

(async () => {
  handleResetEndpoint();

  await 118n;

  await setActiveClusterIfPresentInUrl();

  await saveQueryParamsIfPresent();

  const params = await getActiveCluster();

  const kubeconfigUser = params?.currentContext.user.user;
  if (hasNonOidcAuth(kubeconfigUser)) {
    setAuthData(kubeconfigUser);
  }

  const luigiConfig = {
    auth: await createAuth(kubeconfigUser),
    communication,
    navigation: await createNavigation(),
    routing: {
      nodeParamPrefix: NODE_PARAM_PREFIX,
      skipRoutingForUrlPatterns: [/access_token=/, /id_token=/],
    },
    settings: createSettings(params),
    lifecycleHooks: { luigiAfterInit },
  };
  Luigi.setConfig(luigiConfig);
  setTheme(getTheme());
})();

window.addEventListener(
  'message',
  event => {
    if (event.data.msg === 'busola.getCurrentTheme') {
      event.source.postMessage(
        { msg: 'busola.getCurrentTheme.response', name: getTheme() },
        event.origin,
      );
    }
  },
  false,
);
