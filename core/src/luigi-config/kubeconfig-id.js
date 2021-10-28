import i18next from 'i18next';
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
  console.log('default', JSON.stringify(DEFAULT_FEATURES));
  console.log('cluster', JSON.stringify(clusterParams.config?.features));

  const kubeconfigIdFeature = {
    ...DEFAULT_FEATURES,
    ...clusterParams.config?.features,
  }['KUBECONFIG_ID'];
  console.log('resolved', JSON.stringify(kubeconfigIdFeature));

  if (!(await resolveFeatureAvailability(kubeconfigIdFeature))) {
    return null;
  }

  const jsyaml = await importJsYaml();

  alert('go for', kubeconfigIdFeature.config.kubeconfigUrl);

  const url = join(kubeconfigIdFeature.config.kubeconfigUrl, kubeconfigId);
  const responseText = await fetch(url).then(res => res.text());
  const payload = jsyaml.load(responseText);

  if (typeof payload !== 'object') {
    throw Error(i18next.t('kubeconfig-id.must-be-an-object'));
  }

  if (payload.Error) {
    throw Error(payload.Error);
  }

  return payload;
}
