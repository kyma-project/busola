import { getAuthData } from '../auth/auth-storage';
import { convertStaticFeatures } from '../feature-discovery';
import { config } from './../config';
import { failFastFetch } from './../navigation/queries';

let clusterConfig = null;

export function getTargetClusterConfig() {
  return clusterConfig;
}

export async function loadTargetClusterConfig() {
  try {
    const res = await failFastFetch(
      config.backendAddress +
        '/api/v1/namespaces/kube-public/configmaps/busola-config',
      getAuthData(),
    );
    clusterConfig = JSON.parse((await res.json()).data.config);

    if (clusterConfig?.config?.features) {
      clusterConfig.config.features = convertStaticFeatures(
        clusterConfig.config.features,
      );
    }
  } catch (e) {
    if (e.statusCode !== 404) {
      // don't warn on Not Found, that's fine
      console.warn(e);
    }
    clusterConfig = {};
  }
}
