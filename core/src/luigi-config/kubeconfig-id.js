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

  const kubeconfigIdFeature = {
    ...DEFAULT_FEATURES,
    ...clusterParams.config?.features,
  }['KUBECONFIG_ID'];
  alert('3' + kubeconfigIdFeature.config.kubeconfigUrl);
  console.log('resolved', JSON.stringify(kubeconfigIdFeature));

  if (!(await resolveFeatureAvailability(kubeconfigIdFeature))) {
    return null;
  }

  const jsyaml = await importJsYaml();

  alert('go for ' + kubeconfigIdFeature.config.kubeconfigUrl);

  const url = join(kubeconfigIdFeature.config.kubeconfigUrl, kubeconfigId);
  const responseText = await fetch(url).then(res => res.text());
  alert(responseText);
  const payload = jsyaml.load(responseText);
  alert('jest obiekt? ' + (typeof payload !== 'object'));
  if (typeof payload !== 'object') {
    throw Error(i18next.t('kubeconfig-id.must-be-an-object'));
  }

  alert(typeof payload);
  if (payload.Error) {
    throw Error(payload.Error);
  }

  return payload;
}
