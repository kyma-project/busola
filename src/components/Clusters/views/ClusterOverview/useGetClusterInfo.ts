import jsyaml from 'js-yaml';
import { useGet } from 'shared/hooks/BackendAPI/useGet';

export type WorkerPool = {
  name?: string;
  machineType?: string;
  autoScalerMin?: number;
  autoScalerMax?: number;
  haZones?: boolean | string[] | number;
};

export type ClusterInfo = {
  provider?: string;
  natGatewayIps?: string[];
  globalAccountID?: string;
  region?: string;
  seedRegion?: string;
  subaccountID?: string;
  platformRegion?: string;
  environmentInstanceID?: string;
  instanceName?: string;
  networkDetails?: { dualStackIPEnabled?: boolean };
  workerPools?: Record<string, WorkerPool>;
  [key: string]: unknown;
};

type ConfigMapData = { data?: Record<string, string> };

export function useGetClusterInfo(): {
  clusterInfo?: ClusterInfo;
  loading: boolean;
} {
  const { data: shootInfoCM, loading: shootInfoLoading } = useGet(
    '/api/v1/namespaces/kube-system/configmaps/shoot-info',
  ) as {
    data: ConfigMapData | null;
    loading: boolean;
  };

  const { data: kymaInfoCM, loading: kymaInfoLoading } = useGet(
    '/api/v1/namespaces/kyma-system/configmaps/kyma-info',
  ) as { data: ConfigMapData | null; loading: boolean };

  const { data: kymaProvisioningInfoCM, loading: kymaProvisioningInfoLoading } =
    useGet(
      '/api/v1/namespaces/kyma-system/configmaps/kyma-provisioning-info',
    ) as { data: ConfigMapData | null; loading: boolean };

  const loading =
    shootInfoLoading || kymaInfoLoading || kymaProvisioningInfoLoading;

  if (loading) return { loading: true };

  let provisioningDetails: Partial<ClusterInfo> = {};
  const detailsYaml = kymaProvisioningInfoCM?.data?.details;
  try {
    if (detailsYaml) {
      provisioningDetails =
        (jsyaml.load(detailsYaml) as Partial<ClusterInfo>) ?? {};
    }
  } catch (error) {
    console.warn(
      'Failed to parse kyma-provisioning-info details configmap',
      error,
    );
  }

  return {
    clusterInfo: {
      provider: shootInfoCM?.data?.provider,
      natGatewayIps: shootInfoCM?.data?.egressCIDRs
        ? shootInfoCM.data.egressCIDRs.split(',')
        : kymaInfoCM?.data?.['cloud.natGatewayIps']?.split(', '),
      ...provisioningDetails,
    },
    loading: false,
  };
}
