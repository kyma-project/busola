import { getAuthData } from '../auth/auth-storage';
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
    const r = await res.json();
    clusterConfig = JSON.parse(r.data.config);
    console.log('loaded config', r);
  } catch (e) {
    if (e.statusCode !== 404) {
      // don't warn on Not Found, that's fine
      console.warn(e);
    }
    clusterConfig = {};
  }
}
