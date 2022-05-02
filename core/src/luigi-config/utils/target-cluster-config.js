import { fetchCache } from '../fetch-cache';
import { reloadNavigation } from '../navigation/navigation-data-init';
import { config } from './../config';

export function getTargetClusterConfig() {
  try {
    const cm = fetchCache.getSync(
      config.backendAddress +
        '/api/v1/namespaces/kube-public/configmaps/busola-config',
    );
    return JSON.parse(cm?.data?.config || '{}') || {};
  } catch (e) {
    console.warn('cannot get cluster config', e);
    return {};
  }
}

export async function loadTargetClusterConfig() {
  await fetchCache.subscribe({
    path:
      config.backendAddress +
      '/api/v1/namespaces/kube-public/configmaps/busola-config',
    callback: reloadNavigation,
    refreshIntervalMs: 5000,
  });
}
