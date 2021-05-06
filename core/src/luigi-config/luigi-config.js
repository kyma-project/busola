import { saveCurrentLocation } from './navigation/previous-location';
import { getAuthData, setAuthData } from './auth/auth-storage';
import { communication } from './communication';
import { createSettings } from './settings';
import { createAuth } from './auth/auth.js';
import { getActiveCluster, setActiveClusterIfPresentInUrl } from './cluster-management'
import { loadSystemNamespacesToggle } from './utils/system-namespaces-toggle';

import {
  createNavigation,
  addClusterNodes,
} from './navigation/navigation-data-init';

export const NODE_PARAM_PREFIX = `~`;

async function luigiAfterInit() {
  const params = getActiveCluster();
  const isClusterChoosen = !!params;

  // save location, as we'll be logged out in a moment
  if (!getAuthData()) {
    saveCurrentLocation();
  }

  loadSystemNamespacesToggle();

  if (!isClusterChoosen) {
    Luigi.navigation().navigate('/clusters');
  } else {
    if (params?.auth && getAuthData()) {
      await addClusterNodes();
    }
  }
  Luigi.ux().hideAppLoadingIndicator();
}

(async () => {
  setActiveClusterIfPresentInUrl();

  const params = getActiveCluster();

  if (params?.rawAuth) {
    setAuthData(params.rawAuth);
  }

  const luigiConfig = {
    auth: createAuth(params?.auth),
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
