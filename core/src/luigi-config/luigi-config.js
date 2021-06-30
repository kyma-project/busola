import {
  saveCurrentLocation,
  tryRestorePreviousLocation,
} from './navigation/previous-location';
import { getAuthData, setAuthData } from './auth/auth-storage';
import { communication } from './communication';
import { createSettings } from './settings';
import { createAuth, hasKubeconfigAuth } from './auth/auth.js';
import { saveInitParamsIfPresent } from './init-params/init-params.js';
import {
  getActiveCluster,
  setActiveClusterIfPresentInUrl,
} from './cluster-management';
import { loadHiddenNamespacesToggle } from './utils/hidden-namespaces-toggle';

import {
  createNavigation,
  addClusterNodes,
} from './navigation/navigation-data-init';

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
      if (
        getAuthData() &&
        !hasKubeconfigAuth(params.currentContext?.user?.user)
      ) {
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
  await setActiveClusterIfPresentInUrl();

  await saveInitParamsIfPresent();

  const params = await getActiveCluster();

  const kubeconfigUser = params?.currentContext.user.user;
  if (hasKubeconfigAuth(kubeconfigUser)) {
    setAuthData(kubeconfigUser);
  }

  const luigiConfig = {
    auth:
      !hasKubeconfigAuth(kubeconfigUser) && createAuth(params?.config?.auth),
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
})();
