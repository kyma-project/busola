import * as fetchCache from './../cache/fetch-cache';
import { reloadNavigation } from '../navigation/navigation-data-init';

const CONFIGMAP_URL = '/api/v1/namespaces/kube-public/configmaps/busola-config';

export function getTargetClusterConfig() {
  try {
    const res = fetchCache.getSync(CONFIGMAP_URL);
    if (!res || res.status === 404) {
      return {};
    }
    return JSON.parse(res.data?.data?.config || '{}') || {};
  } catch (e) {
    console.warn('cannot get cluster config', e);
    return {};
  }
}

export async function loadTargetClusterConfig() {
  await fetchCache.subscribe({
    path: CONFIGMAP_URL,
    callback: reloadNavigation,
    refreshIntervalMs: 5 * 60 * 1000, // 5 mins
  });
}
