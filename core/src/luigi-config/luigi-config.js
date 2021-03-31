import {
  saveCurrentLocation,
  getAuthData,
  getPreviousLocation,
} from './navigation/navigation-helpers';
import { communication } from './communication';
import { settings } from './settings';
import { createAuth } from './auth.js';
import { saveInitParamsIfPresent } from './init-params';
import { config } from './config';
import { getInitParams } from './init-params';

import {
  navigation,
  getNavigationData,
  resolveNavigationNodes,
} from './navigation/navigation-data-init';
import { onQuotaExceed } from './luigi-event-handlers';

export const NODE_PARAM_PREFIX = `~`;

(async () => {
  await saveInitParamsIfPresent(location);

  const params = getInitParams();

  if (!params && !config.isNpx) {
    window.location = '/login.html';
  }

  // don't do OIDC flow on npx or if token/CA is already there
  const shouldCreateAuth = !config.isNpx && !params.rawAuth;

  const luigiConfig = {
    auth: shouldCreateAuth && (await createAuth(params.auth)),
    communication,
    navigation,
    routing: {
      nodeParamPrefix: NODE_PARAM_PREFIX,
      skipRoutingForUrlPatterns: [/access_token=/, /id_token=/],
    },
    settings,
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
  };
  Luigi.setConfig(luigiConfig);
})();

window.addEventListener('message', (e) => {
  if (e.data.msg === 'busola.quotaexceeded') {
    onQuotaExceed(e.data);
  }
});
