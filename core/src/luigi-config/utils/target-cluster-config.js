import { fetchCache } from '../fetch-cache';
import { reloadNavigation } from '../navigation/navigation-data-init';
import { config } from './../config';

function todo_configmapToDataWeNeed(configmap) {
  return JSON.parse(configmap?.data?.config || '{}') || {};
}

export function getTargetClusterConfig() {
  const cm = fetchCache.getSync(
    config.backendAddress +
      '/api/v1/namespaces/kube-public/configmaps/busola-config',
  );
  return todo_configmapToDataWeNeed(cm);
}

export async function loadTargetClusterConfig() {
  fetchCache.getAndSubscribe({
    path:
      config.backendAddress +
      '/api/v1/namespaces/kube-public/configmaps/busola-config',
    callback: (prev, next) => {
      console.log('config changed', prev, next);
      reloadNavigation();
    },
    refreshIntervalMs: 5000,
  });

  // try {
  //   const res = await failFastFetch(
  //     config.backendAddress +
  //       '/api/v1/namespaces/kube-public/configmaps/busola-config',
  //     getAuthData(),
  //   );
  //   clusterConfig = JSON.parse((await res.json()).data.config);
  // } catch (e) {
  //   if (e.statusCode !== 404) {
  //     // don't warn on Not Found, that's fine
  //     console.warn(e);
  //   }
  //   clusterConfig = {};
  // }
}
