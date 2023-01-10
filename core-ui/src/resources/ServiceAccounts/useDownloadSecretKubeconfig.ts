import { useDownloadKubeconfigWithToken } from './useDownloadKubeconfigWithToken';

export function useDownloadSecretKubeconfig() {
  const downloadKubeconfig = useDownloadKubeconfigWithToken();

  return (secret: any) => {
    // TODO add type for Secret
    if (secret.type !== 'kubernetes.io/service-account-token') return;

    const name = secret.metadata.name;
    const serviceAccountToken = atob(secret.data.token);
    downloadKubeconfig(name, serviceAccountToken);
  };
}
