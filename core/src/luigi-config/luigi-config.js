import i18next from 'i18next';
import i18nextBackend from 'i18next-http-backend';
import yaml from 'js-yaml';
import './../assets/libs/luigi-core/luigi.css';
import '../index.css';

import {
  saveCurrentLocation,
  tryRestorePreviousLocation,
} from './navigation/previous-location';
import { communication } from './communication';
import { createSettings } from './settings';
import { clusterLogin } from './auth/auth';
import { handleKubeconfigIdIfPresent } from './kubeconfig-id';
import {
  getActiveCluster,
  handleResetEndpoint,
  setActiveClusterIfPresentInUrl,
} from './cluster-management/cluster-management';
import { initSentry } from './sentry';

import { createNavigation } from './navigation/navigation-data-init';
import { initTheme } from './utils/theme';
import { readFeatureToggles } from './utils/feature-toggles';
import { ssoLogin } from './auth/sso';
import { setNavFooterText } from './nav-footer';
import { resolveSecondaryFeatures } from './feature-discovery';

const luigiAfterInit = () => window.Luigi.ux().hideAppLoadingIndicator();

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
  initTheme();

  const activeCluster = getActiveCluster();
  const navigation = await createNavigation();
  window.Luigi.setConfig({
    communication,
    navigation,
    routing: {
      nodeParamPrefix: NODE_PARAM_PREFIX,
      skipRoutingForUrlPatterns: [/access_token=/, /id_token=/],
    },
    settings: createSettings(activeCluster),
    lifecycleHooks: { luigiAfterInit },
  });

  // make sure Luigi config is set - we can't use luigiAfterInit as it won't
  // be fired if we had already ran Luigi.setConfig during sso/cluster login
  await new Promise(resolve => setTimeout(resolve, 100));

  await setNavFooterText();
  if (!getActiveCluster()) {
    if (!window.location.pathname.startsWith('/clusters')) {
      window.Luigi.navigation().navigate('/clusters');
    }
  } else {
    tryRestorePreviousLocation();
  }
  await resolveSecondaryFeatures();
}

(async () => {
  handleResetEndpoint();

  await initSentry();

  await i18n;

  setActiveClusterIfPresentInUrl();

  // save location, as we'll may be logged out in a moment
  saveCurrentLocation();

  await handleKubeconfigIdIfPresent();

  readFeatureToggles([
    'dontConfirmDelete',
    'showHiddenNamespaces',
    'disableResourceProtection',
  ]);

  await ssoLogin(luigiAfterInit);

  // workaround for luigi issue
  await new Promise(resolve => setTimeout(resolve, 500));

  await clusterLogin(luigiAfterInit);

  await initializeBusola();
})();
