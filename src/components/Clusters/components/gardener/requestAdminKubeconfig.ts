import jsyaml from 'js-yaml';
import { base64Decode } from 'shared/helpers';
import { ValidKubeconfig } from 'types';

type AdminKubeconfigResponse = { status: { kubeconfig: string } };

export async function requestAdminKubeconfig({
  backendAddress,
  gardenServer,
  token,
  namespace,
  shootName,
  expirationSeconds = 3 * 60 * 60, // 3h
}: {
  backendAddress: string;
  gardenServer: string;
  token: string;
  namespace: string;
  shootName: string;
  expirationSeconds?: number;
}): Promise<ValidKubeconfig> {
  const url = `${backendAddress}/apis/core.gardener.cloud/v1beta1/namespaces/${namespace}/shoots/${shootName}/adminkubeconfig`;
  const payload = {
    apiVersion: 'authentication.gardener.cloud/v1alpha1',
    kind: 'AdminKubeconfigRequest',
    spec: { expirationSeconds },
  };

  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
      'X-Cluster-Url': gardenServer,
      'X-K8s-Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error(response.statusText);

  const result = (await response.json()) as AdminKubeconfigResponse;
  return jsyaml.load(base64Decode(result.status.kubeconfig)) as ValidKubeconfig;
}
