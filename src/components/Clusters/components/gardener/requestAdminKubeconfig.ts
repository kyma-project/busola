import jsyaml from 'js-yaml';
import { base64Decode } from 'shared/helpers';
import { ValidKubeconfig } from 'types';

type AdminKubeconfigResponse = {
  status: { kubeconfig: string; expirationTimestamp?: string };
};

export type AdminKubeconfigResult = {
  kubeconfig: ValidKubeconfig;
  // The actual expiry the garden granted (may be shorter than requested).
  expirationTimestamp?: string;
};

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
}): Promise<AdminKubeconfigResult> {
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

  if (!response.ok) {
    let message = response.statusText;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // body empty or non-JSON – keep statusText
    }
    if (!message) message = `HTTP ${response.status}`;
    throw new Error(message);
  }

  const result = (await response.json()) as AdminKubeconfigResponse;
  return {
    kubeconfig: jsyaml.load(
      base64Decode(result.status.kubeconfig),
    ) as ValidKubeconfig,
    expirationTimestamp: result.status.expirationTimestamp,
  };
}
