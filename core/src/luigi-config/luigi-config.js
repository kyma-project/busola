import {
  saveCurrentLocation,
  getAuthData,
  getPreviousLocation,
} from './navigation/navigation-helpers';
import { communication } from './communication';
import { createSettings } from './settings';
import { createAuth } from './auth.js';
import { saveInitParamsIfPresent } from './init-params';
import { getInitParams } from './init-params';

import {
  navigation,
  getNavigationData,
  resolveNavigationNodes,
} from './navigation/navigation-data-init';

export const NODE_PARAM_PREFIX = `~`;

(async () => {
  await saveInitParamsIfPresent(location);

  const params = getInitParams();
  if (!params) {
    window.location = '/login.html';
    return;
  }

  const luigiConfig = {
    auth: !params?.rawAuth && (await createAuth(params?.auth)),
    communication,
    navigation,
    routing: {
      nodeParamPrefix: NODE_PARAM_PREFIX,
      skipRoutingForUrlPatterns: [/access_token=/, /id_token=/],
    },
    settings: createSettings(params),
    lifecycleHooks: {
      luigiAfterInit: () => {
        if (params?.rawAuth) {
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
  };
  Luigi.setConfig(luigiConfig);
})();
