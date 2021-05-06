import { saveCurrentLocation } from './navigation/previous-location';
import { getAuthData, setAuthData } from './auth-storage';
import { communication } from './communication';
import { createSettings } from './settings';
import { createAuth } from './auth.js';
import { saveInitParamsIfPresent } from './init-params';
import { getInitParams } from './clusters';
import { loadSystemNamespacesToggle } from './utils/system-namespaces-toggle';

import {
  createNavigation,
  addClusterNodes,
} from './navigation/navigation-data-init';
import { onQuotaExceed } from './luigi-event-handlers';

export const NODE_PARAM_PREFIX = `~`;

async function luigiAfterInit() {
  const params = getInitParams();
  const isClusterChoosen = !!params;

  if (!getAuthData()) {
    console.log('save current', window.location.pathname + window.location.search);
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
  await saveInitParamsIfPresent(location);

  const params = getInitParams();

  if (params?.rawAuth) {
    setAuthData(params.rawAuth);
  }

  const luigiConfig = {
    auth: await createAuth(params?.auth),
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
