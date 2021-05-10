import { saveCurrentLocation } from './navigation/previous-location';
import { getAuthData, setAuthData } from './auth/auth-storage';
import { communication } from './communication';
import { createSettings } from './settings';
import { createAuth } from './auth/auth.js';
import { saveInitParamsIfPresent } from './init-params';
import {
  getActiveCluster,
  setActiveClusterIfPresentInUrl,
} from './cluster-management';
import { loadSystemNamespacesToggle } from './utils/system-namespaces-toggle';

import {
  createNavigation,
  addClusterNodes,
} from './navigation/navigation-data-init';

export const NODE_PARAM_PREFIX = `~`;

async function luigiAfterInit() {
  Luigi.ux().hideAppLoadingIndicator();

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
}

(async () => {
  setActiveClusterIfPresentInUrl();

  await saveInitParamsIfPresent();

  const params = getActiveCluster();

  if (params?.rawAuth) {
    setAuthData(params.rawAuth);
  }

  const luigiConfig = {
<<<<<<< HEAD
    auth: !params.rawAuth && (await createAuth(params.auth)),
=======
    auth: createAuth(params?.auth),
>>>>>>> main
    communication,
    navigation: await createNavigation(),
    routing: {
      nodeParamPrefix: NODE_PARAM_PREFIX,
      skipRoutingForUrlPatterns: [/access_token=/, /id_token=/],
    },
    settings: createSettings(params),
<<<<<<< HEAD
    lifecycleHooks: {
      luigiAfterInit: () => {
        if (params.rawAuth) {
          Luigi.auth().store.setAuthData(params.rawAuth);
        }
        const showSystemNamespaces = localStorage.getItem(
          'busola.showSystemNamespaces'
        );

        if (showSystemNamespaces === 'true') {
          Luigi.featureToggles().setFeatureToggle('showSystemNamespaces');
        } else {
          Luigi.featureToggles().unsetFeatureToggle('showSystemNamespaces');
        }
        const auth = getAuthData();
        if (auth) {
          getNavigationData(auth).then((response) => {
            resolveNavigationNodes(response);
            Luigi.ux().hideAppLoadingIndicator();

            const prevLocation = getPreviousLocation();
            if (prevLocation) {
              Luigi.navigation().navigate(prevLocation);
            }
          });
        } else {
          saveCurrentLocation();
        }
      },
    },
=======
    lifecycleHooks: { luigiAfterInit },
>>>>>>> main
  };
  Luigi.setConfig(luigiConfig);
})();
