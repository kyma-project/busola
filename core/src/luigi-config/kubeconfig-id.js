import { getClusterParams } from './cluster-params';
import { resolveFeatureAvailability } from './features';
import { DEFAULT_FEATURES, PARAMS_VERSION } from './init-params/constants';

export async function applyKubeconfigIdIfPresent(kubeconfigId, initParams) {
  if (!kubeconfigId) {
    return;
  }

  const clusterParams = await getClusterParams();

  const feature = {
    ...DEFAULT_FEATURES,
    ...clusterParams.config?.features,
    ...initParams.config?.features,
  }['KUBECONFIG_ID'];

  if (!(await resolveFeatureAvailability(feature))) {
    return;
  }

  if (!feature.config.kubeconfigUrl.endsWith('/')) {
    feature.config.kubeconfigUrl += '/';
  }

  try {
    const response = await fetch(feature.config.kubeconfigUrl + kubeconfigId);

    initParams.kubeconfig = await response.json();
    if (!initParams.config?.version) {
      initParams.config = {
        ...initParams.config,
        version: PARAMS_VERSION,
      };
    }
  } catch (e) {
    alert('Cannot reach kubeconfig ID service.');
    throw e;
  }
}
