import { loadKubeconfigById } from './loadKubeconfigById';
import i18next from 'i18next';

export async function handleKubeconfigIdIfPresent() {
  const searchParams = new URL(location).searchParams;
  const kubeconfigId = searchParams.get('kubeconfigID');

  try {
    const kubeconfig = await loadKubeconfigById(kubeconfigId);
    if (!kubeconfig) {
      return null;
    }

    return kubeconfig;
  } catch (e) {
    alert(i18next.t('kubeconfig-id.error', { error: e.message }));
    console.warn(e);
  }
}
