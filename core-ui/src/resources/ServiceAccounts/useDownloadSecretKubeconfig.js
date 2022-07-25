import { useMicrofrontendContext } from 'shared/contexts/MicrofrontendContext';
import jsyaml from 'js-yaml';
import { saveAs } from 'file-saver';

export function useDownloadSecretKubeconfig() {
  const { cluster, namespaceId: namespace } = useMicrofrontendContext();

  const createKubeconfig = (cluster, name, token) => ({
    apiVersion: 'v1',
    kind: 'Config',
    'current-context': name,
    users: [
      {
        name: name,
        user: { token },
      },
    ],
    clusters: [cluster],
    contexts: [
      {
        context: {
          cluster: cluster.name,
          user: name,
          namespace,
        },
        name: name,
      },
    ],
  });

  return secret => {
    if (secret.type !== 'kubernetes.io/service-account-token') return;

    const name = secret.metadata.name;
    const serviceAccountToken = atob(secret.data.token);
    const kubeconfig = createKubeconfig(cluster, name, serviceAccountToken);

    const blob = new Blob([jsyaml.dump(kubeconfig)], {
      type: 'application/yaml;charset=utf-8',
    });
    saveAs(blob, name + '.yaml');
  };
}
