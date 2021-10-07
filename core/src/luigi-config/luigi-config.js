import i18next from 'i18next';
import i18nextBackend from 'i18next-http-backend';
import yaml from 'js-yaml';

import {
  saveCurrentLocation,
  tryRestorePreviousLocation,
} from './navigation/previous-location';
import { communication } from './communication';
import { createSettings } from './settings';
import { clusterLogin, hasNonOidcAuth } from './auth/auth';
import { saveQueryParamsIfPresent } from './kubeconfig-id/kubeconfig-id.js';
import {
  getActiveCluster,
  handleResetEndpoint,
  saveCARequired,
  setActiveClusterIfPresentInUrl,
} from './cluster-management/cluster-management';
import { initSentry } from './sentry';

import { createNavigation } from './navigation/navigation-data-init';
import { initTheme } from './utils/theme';
import { readFeatureToggles } from './utils/feature-toggles';
import { loadTargetClusterConfig } from './utils/target-cluster-config';
import { checkClusterStorageType } from './cluster-management/clusters-storage';
import { ssoLogin } from './auth/sso';
import { showAlert } from './utils/showAlert';
import { getAuthData } from './auth/auth-storage';

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
  const activeCluster = await getActiveCluster();

  Luigi.setConfig({
    communication,
    navigation: await createNavigation(),
    routing: {
      nodeParamPrefix: NODE_PARAM_PREFIX,
      skipRoutingForUrlPatterns: [/access_token=/, /id_token=/],
    },
    settings: await createSettings(activeCluster),
    lifecycleHooks: { luigiAfterInit },
  });

  // make sure Luigi config is set - luigiAfterInit will not be fired
  // if we had already used Luigi.setConfig in sso/cluster login
  await new Promise(resolve => setTimeout(resolve, 100));
  if (!(await getActiveCluster())) {
    if (!window.location.pathname.startsWith('/clusters')) {
      Luigi.navigation().navigate('/clusters');
    }
  } else {
    tryRestorePreviousLocation();
  }
}

(async () => {
  handleResetEndpoint();
  initTheme();

  await initSentry();

  await i18n;

  await saveQueryParamsIfPresent();

  readFeatureToggles(['dontConfirmDelete', 'showHiddenNamespaces']);

  // save location, as we'll may be logged out in a moment
  saveCurrentLocation();

  await ssoLogin(luigiAfterInit);

  // workaround for luigi issue
  await new Promise(resolve => setTimeout(resolve, 500));

  await clusterLogin(luigiAfterInit);

  await initializeBusola();
})();
