import { Kubeconfig, ValidKubeconfig } from 'types';

export type ShootRef = {
  namespace: string;
  name: string;
  gardenClusterIdentity?: string;
};

const GARDENLOGIN_ARG = 'gardenlogin';
const EXEC_EXTENSION_NAME = 'client.authentication.k8s.io/exec';

export function isGardenloginKubeconfig(kubeconfig?: Kubeconfig): boolean {
  const users = (kubeconfig as ValidKubeconfig | undefined)?.users ?? [];
  return users.some((u) => {
    const exec = (u?.user as { exec?: { command?: string; args?: string[] } })
      ?.exec;
    if (!exec?.command) return false;
    if (exec.command === 'kubectl-gardenlogin') return true;
    return exec.command === 'kubectl' && !!exec.args?.includes(GARDENLOGIN_ARG);
  });
}

export function extractShootRef(kubeconfig?: Kubeconfig): ShootRef | null {
  const kc = kubeconfig as ValidKubeconfig | undefined;
  if (!kc) return null;

  const contextName = kc['current-context'];
  const context =
    kc.contexts?.find((c) => c.name === contextName) ?? kc.contexts?.[0];
  const clusterName = context?.context?.cluster;
  const cluster =
    kc.clusters?.find((c) => c.name === clusterName) ?? kc.clusters?.[0];

  const extensions = (
    cluster?.cluster as { extensions?: Array<any> } | undefined
  )?.extensions;
  const ext = extensions?.find(
    (e) => e?.name === EXEC_EXTENSION_NAME,
  )?.extension;
  const shootRef = ext?.shootRef;
  if (!shootRef?.namespace || !shootRef?.name) return null;

  return {
    namespace: shootRef.namespace,
    name: shootRef.name,
    gardenClusterIdentity: ext?.gardenClusterIdentity,
  };
}
