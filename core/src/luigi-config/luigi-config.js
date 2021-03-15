import {
  saveCurrentLocation,
  getToken,
  getPreviousLocation,
} from './navigation/navigation-helpers';
import { communication } from './communication';
import { settings } from './settings';
import { createAuth } from './auth.js';
import { saveInitParamsIfPresent } from './init-params';
import { config } from './config';

import {
  navigation,
  getNavigationData,
  resolveNavigationNodes,
} from './navigation/navigation-data-init';
import { onQuotaExceed } from './luigi-event-handlers';

export const NODE_PARAM_PREFIX = `~`;

(async () => {
  await saveInitParamsIfPresent(location);
  const luigiConfig = {
    auth: !config.isNpx && (await createAuth()),
    communication,
    navigation,
    routing: {
      nodeParamPrefix: NODE_PARAM_PREFIX,
      skipRoutingForUrlPatterns: [/access_token=/, /id_token=/],
    },
    settings,
    lifecycleHooks: {
      luigiAfterInit: () => {
        const showSystemNamespaces = localStorage.getItem(
          'busola.showSystemNamespaces'
        );

        if (showSystemNamespaces === 'true') {
          Luigi.featureToggles().setFeatureToggle('showSystemNamespaces');
        } else {
          Luigi.featureToggles().unsetFeatureToggle('showSystemNamespaces');
        }
        const token = getToken();
        if (token) {
          getNavigationData(token).then((response) => {
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
