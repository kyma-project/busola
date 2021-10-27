import { getBusolaClusterParams } from './busola-cluster-params';
import { resolveFeatureAvailability } from './features';
import { DEFAULT_FEATURES } from './kubeconfig-id/constants';

function join(path, fileName) {
  if (!path.endsWith('/')) {
    path += '/';
  }
  return path + fileName;
}

async function importJsYaml() {
  return (await import('js-yaml')).default;
}

export async function getKubeconfigById(kubeconfigId) {
  if (!kubeconfigId) {
    return null;
  }

  const clusterParams = await getBusolaClusterParams();

  const kubeconfigIdFeature = {
    ...DEFAULT_FEATURES,
    ...clusterParams.config?.features,
  }['KUBECONFIG_ID'];

  if (!(await resolveFeatureAvailability(kubeconfigIdFeature))) {
    return null;
  }

  const jsyaml = await importJsYaml();

  const url = join(kubeconfigIdFeature.config.kubeconfigUrl, kubeconfigId);
  const responseText = await fetch(url).then(res => res.text());
  console.log('responseText', responseText);
  const payload = jsyaml.load(responseText);

  if (payload.Error) {
    throw Error(payload.Error);
  }

  return payload;
}
