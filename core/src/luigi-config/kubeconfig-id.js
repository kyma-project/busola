import { getClusterParams } from './cluster-params';
import { resolveFeatureAvailability } from './features';
import { DEFAULT_FEATURES, PARAMS_VERSION } from './init-params/constants';

function join(path, fileName) {
  if (!path.endsWith('/')) {
    path += '/';
  }
  return path + fileName;
}

async function importJsYaml() {
  return (await import('js-yaml')).default;
}

export async function applyKubeconfigIdIfPresent(kubeconfigId, initParams) {
  if (!kubeconfigId) {
    return;
  }

  const clusterParams = await getClusterParams();

  const kubeconfigIdFeature = {
    ...DEFAULT_FEATURES,
    ...clusterParams.config?.features,
    ...initParams.config?.features,
  }['KUBECONFIG_ID'];

  if (!(await resolveFeatureAvailability(kubeconfigIdFeature))) {
    return;
  }

  const jsyaml = await importJsYaml();

  const url = join(kubeconfigIdFeature.config.kubeconfigUrl, kubeconfigId);
  const responseText = await fetch(url).then(res => res.text());
  const payload = jsyaml.load(responseText);

  if (payload.Error) {
    throw Error(payload.Error);
  }

  initParams.kubeconfig = payload;
  if (!initParams.config?.version) {
    initParams.config = {
      ...initParams.config,
      version: PARAMS_VERSION,
    };
  }
}
