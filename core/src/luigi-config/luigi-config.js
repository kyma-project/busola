import i18next from 'i18next';
import i18nextBackend from 'i18next-http-backend';
import yaml from 'js-yaml';

import { saveCurrentLocation } from './navigation/previous-location';
import { communication } from './communication';
import { createSettings } from './settings';
import { clusterLogin } from './auth/auth';
import { saveQueryParamsIfPresent } from './kubeconfig-id/kubeconfig-id.js';
import {
  getActiveCluster,
  handleResetEndpoint,
  saveCARequired,
  setActiveClusterIfPresentInUrl,
} from './cluster-management/cluster-management';
import { initSentry } from './sentry';

import { createNavigation } from './navigation/navigation-data-init';
import { setTheme, getTheme } from './utils/theme';
import { readFeatureToggles } from './utils/feature-toggles';
import { loadTargetClusterConfig } from './utils/target-cluster-config';
import { checkClusterStorageType } from './cluster-management/clusters-storage';
import { ssoLogin } from './auth/sso';

const luigiAfterInit = () => Luigi.ux().hideAppLoadingIndicator();

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

async function initializeBusola() {
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
    settings: await createSettings(params),
    lifecycleHooks: { luigiAfterInit },
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
  handleResetEndpoint();

  await initSentry();

  await i18n;

  await saveQueryParamsIfPresent();

  readFeatureToggles(['dontConfirmDelete', 'showHiddenNamespaces']);

  // save location, as we'll may be logged out in a moment
  saveCurrentLocation();

  console.log('sso login');
  await ssoLogin(luigiAfterInit);
  console.log('LOGGED WITH SSO');
  await new Promise(resolve => setTimeout(resolve, 500));

  console.log('start cluster login');
  await clusterLogin(luigiAfterInit);
  console.log('end cluster login');

  await initializeBusola();
})();
