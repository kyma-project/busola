import { getClusterConfig } from 'state/utils/getBackendInfo';

export interface ClusterRegion {
  isEUAccessOnly?: boolean;
  region?: string;
  platformRegion?: string;
  provider?: string;
}

export async function getClusterRegion(
  shootId: string,
  signal?: AbortSignal,
): Promise<ClusterRegion> {
  const { backendAddress } = getClusterConfig();
  const url = `${backendAddress}/ai-chat/cluster-region/${encodeURIComponent(
    shootId,
  )}`;

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}
