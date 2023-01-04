import jsyaml from 'js-yaml';
import { saveAs } from 'file-saver';
import { useRecoilValue } from 'recoil';
import { clusterState } from 'state/clusterAtom';
import { activeNamespaceIdState } from 'state/activeNamespaceIdAtom';
import { KubeconfigCluster, ValidKubeconfig } from 'types';

export function useDownloadSecretKubeconfig() {
  const cluster = useRecoilValue(clusterState)!;
  const namespace = useRecoilValue(activeNamespaceIdState);

  const createKubeconfig = (
    cluster: KubeconfigCluster,
    name: string,
    token: string,
  ): ValidKubeconfig => ({
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

  return (secret: any) => {
    // TODO
    if (secret.type !== 'kubernetes.io/service-account-token') return;

    const name = secret.metadata.name;
    const serviceAccountToken = atob(secret.data.token);
    const kubeconfig = createKubeconfig(
      cluster.currentContext.cluster,
      name,
      serviceAccountToken,
    );

    const blob = new Blob([jsyaml.dump(kubeconfig)], {
      type: 'application/yaml;charset=utf-8',
    });
    saveAs(blob, name + '.yaml');
  };
}
