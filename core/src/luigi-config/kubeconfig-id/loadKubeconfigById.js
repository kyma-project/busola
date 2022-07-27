import i18next from 'i18next';
import { getBusolaClusterParams } from '../busola-cluster-params';
import { DEFAULT_FEATURES } from './../constants';
import { getClusters } from '../cluster-management/cluster-management';

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
  const clusterParams = await getBusolaClusterParams();

  const kubeconfigIdFeature = {
    ...DEFAULT_FEATURES,
    ...clusterParams.config?.features,
  }['KUBECONFIG_ID'];

  if (!kubeconfigIdFeature.isEnabled) {
    return null;
  }

  const isHome = /^\/?$/.test(window.location.pathname);
  const areClusters = Object.getOwnPropertyNames(getClusters()).length;
  const defaultKubeconfig = kubeconfigIdFeature.config.defaultKubeconfig;

  const anyKubeconfigId =
    kubeconfigId || (isHome && !areClusters && defaultKubeconfig);

  if (!anyKubeconfigId) {
    return null;
  }

  const jsyaml = await importJsYaml();

  const url = join(kubeconfigIdFeature.config.kubeconfigUrl, anyKubeconfigId);

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

export async function loadDefaultKubeconfigId() {
  window.location.replace('/');
}
