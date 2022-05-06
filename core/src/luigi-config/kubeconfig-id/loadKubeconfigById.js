import { fetchQueue } from 'fetch-queue';
import i18next from 'i18next';
import { getBusolaClusterParams } from '../busola-cluster-params';
import { resolveFeatureAvailability } from '../features';
import { DEFAULT_FEATURES } from './../constants';

function join(path, fileName) {
  if (!path.endsWith('/')) {
    path += '/';
  }
  return path + fileName;
}

async function importJsYaml() {
  return (await import('js-yaml')).default;
}

export async function loadKubeconfigById(kubeconfigId) {
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
  const responseText = await fetchQueue(url).then(res => res.text());
  const payload = jsyaml.load(responseText);

  if (typeof payload !== 'object') {
    throw Error(i18next.t('kubeconfig-id.must-be-an-object'));
  }

  if (payload.Error) {
    throw Error(payload.Error);
  }

  return payload;
}
