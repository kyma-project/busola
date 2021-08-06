import { config } from './../config';
import { failFastFetch } from './../navigation/queries';

let clusterConfig = null;

export function getTargetClusterConfig() {
  return clusterConfig;
}

export async function loadTargetClusterConfig(auth) {
  try {
    const res = await failFastFetch(
      config.backendAddress +
        '/api/v1/namespaces/kube-public/configmaps/busola-config',
      auth,
    );
    clusterConfig = JSON.parse((await res.json()).data.config);
  } catch (e) {
    if (e.statusCode === 404) {
      return {}; // there's no custom config on target cluster
    } else {
      console.warn(e);
    }
  }
}
