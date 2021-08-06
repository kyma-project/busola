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
    const data = (await res.json()).data.config;
    clusterConfig = JSON.parse(data);
    console.log('CONFIG LOADED');
  } catch (e) {
    console.warn(e);
  }
}
