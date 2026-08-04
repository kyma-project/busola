import jsyaml from 'js-yaml';
import { useGet } from 'shared/hooks/BackendAPI/useGet';

export type ClusterInfo = {
  provider?: string;
  natGatewayIps?: string[];
  globalAccountID?: string;
  subaccountID?: string;
  [key: string]: unknown;
};

export function useGetClusterInfo(): {
  clusterInfo?: ClusterInfo;
  loading: boolean;
} {
  const { data: shootInfoCM, loading: shootInfoLoading } = useGet(
    '/api/v1/namespaces/kube-system/configmaps/shoot-info',
  );

  const { data: kymaInfoCM, loading: kymaInfoLoading } = useGet(
    '/api/v1/namespaces/kyma-system/configmaps/kyma-info',
  );

  const { data: kymaProvisioningInfoCM, loading: kymaProvisioningInfoLoading } =
    useGet('/api/v1/namespaces/kyma-system/configmaps/kyma-provisioning-info');

  const loading =
    shootInfoLoading || kymaInfoLoading || kymaProvisioningInfoLoading;

  if (loading) return { loading: true };

  let provisioningDetails: Partial<ClusterInfo> = {};
  try {
    provisioningDetails =
      (jsyaml.load(
        kymaProvisioningInfoCM?.data?.details,
      ) as Partial<ClusterInfo>) ?? {};
  } catch (_) {
    // malformed YAML — treat as absent
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
