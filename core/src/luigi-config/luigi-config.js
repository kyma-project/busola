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
  saveCARequired,
  setActiveClusterIfPresentInUrl,
} from './cluster-management/cluster-management';
import { initSentry } from './sentry';

import {
  createNavigation,
  addClusterNodes,
} from './navigation/navigation-data-init';
import { setTheme, getTheme } from './utils/theme';
import { readFeatureToggles } from './utils/feature-toggles';
import { loadTargetClusterConfig } from './utils/target-cluster-config';
import { checkClusterStorageType } from './cluster-management/clusters-storage';
import { createSSOAuth, getSSOAuthData, isSSOEnabled } from './auth/sso';
import { showAlert } from './utils/showAlert';

export const i18n = i18next.use(i18nextBackend).init({
  lng: localStorage.getItem('busola.language') || 'en',
  fallbackLng: 'en',
  backend: {
    loadPath: '/i18n/{{lng}}.yaml',
    parse: data => yaml.load(data),
  },
  saveMissing: true,
  missingKeyHandler: (_lngs, _ns, key) => {
    console.warn(key);
  },
});

export const NODE_PARAM_PREFIX = `~`;

async function ssoLogin() {
  return new Promise(async resolve => {
    Luigi.setConfig({
      auth: await createSSOAuth(resolve),
      lifecycleHooks: {
        luigiAfterInit: Luigi.ux().hideAppLoadingIndicator(),
      },
    });
  });
}

async function clusterLogin() {
  return new Promise(async resolve => {
    const params = await getActiveCluster();

    const kubeconfigUser = params?.currentContext.user.user;
    if (hasNonOidcAuth(kubeconfigUser)) {
      setAuthData(kubeconfigUser);
      resolve();
      return;
    }

    const luigiConfig = {
      auth: await createAuth(resolve, kubeconfigUser),
    };
    Luigi.setConfig(luigiConfig);
  });
}

async function initializeBusola() {
  console.log('init busola');
  await setActiveClusterIfPresentInUrl();
  const params = await getActiveCluster();

  if (params) {
    await saveCARequired();
    await loadTargetClusterConfig();
    await checkClusterStorageType(params.config.storage);
  }
  initTheme();

  const luigiConfig = {
    communication,
    navigation: await createNavigation(),
    routing: {
      nodeParamPrefix: NODE_PARAM_PREFIX,
      skipRoutingForUrlPatterns: [/access_token=/, /id_token=/],
    },
    settings: createSettings(params),
  };
  Luigi.setConfig(luigiConfig);
}

function initTheme() {
  setTheme(getTheme());

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
}

(async () => {
  console.log('start');
  handleResetEndpoint();

  await initSentry();

  await i18n;

  await saveQueryParamsIfPresent();

  readFeatureToggles(['dontConfirmDelete', 'showHiddenNamespaces']);

  // save location, as we'll may be logged out in a moment
  saveCurrentLocation();

  await ssoLogin();
  console.log('weree loggeeed siwh sso', getSSOAuthData());

  await clusterLogin();
  console.log('weree loggeeed to cluster', getAuthData());

  await initializeBusola();
})();
