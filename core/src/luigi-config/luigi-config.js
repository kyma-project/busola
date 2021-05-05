import {
  saveCurrentLocation,
  getAuthData,
  getPreviousLocation,
} from './navigation/navigation-helpers';
import { communication } from './communication';
import { createSettings } from './settings';
import { createAuth } from './auth.js';
import {
  saveInitParamsIfPresent,
  getClusters,
  getInitParams,
} from './init-params';

import { createNavigation, reloadNavigation } from './navigation/navigation-data-init';
import { onQuotaExceed } from './luigi-event-handlers';

export const NODE_PARAM_PREFIX = `~`;

function luigiAfterInit() {
  const params = getInitParams();
  const isClusterChoosen = !!params;

  initFeatureToggles();

  if (!isClusterChoosen) {
    Luigi.navigation().navigate('/clusters');
  } else {
    if (params?.auth) {
      reloadNavigation();
    }
  }
  Luigi.ux().hideAppLoadingIndicator();
}

(async () => {
  await saveInitParamsIfPresent(location);

  const params = getInitParams();
  const isClusterChoosen = !!params;

  if (params?.rawAuth) {
    Luigi.auth().store.setAuthData(params.rawAuth);
  }

  const luigiConfig = {
    auth:
      isClusterChoosen && !params?.rawAuth && (await createAuth(params.auth)),
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

window.addEventListener('message', (e) => {
  if (e.data.msg === 'busola.quotaexceeded') {
    onQuotaExceed(e.data);
  }
});

function initFeatureToggles() {
  const showSystemNamespaces = localStorage.getItem(
    'busola.showSystemNamespaces'
  );

  if (showSystemNamespaces === 'true') {
    Luigi.featureToggles().setFeatureToggle('showSystemNamespaces');
  } else {
    Luigi.featureToggles().unsetFeatureToggle('showSystemNamespaces');
  }
}
