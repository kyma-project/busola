import { useGet } from 'shared/hooks/BackendAPI/useGet';

export function useGetEnvironmentParameters() {
  const {
    data: environmentParametersFromShootInfoCM,
    loading: environmentParametersFromShootInfoCMLoading,
  } = useGet('/api/v1/namespaces/kube-system/configmaps/shoot-info');

  const {
    data: environmentParametersFromKymaInfoCM,
    loading: environmentParametersFromKymaInfoCMLoading,
  } = useGet('/api/v1/namespaces/kyma-system/configmaps/kyma-info');

  const natGatewayIps = !!environmentParametersFromShootInfoCM
    ? environmentParametersFromShootInfoCM?.data['egressCIDRs']?.split(',')
    : environmentParametersFromKymaInfoCM?.data['cloud.natGatewayIps']?.split(
        ', ',
      );

  return {
    natGatewayIps,
    environmentParametersLoading:
      environmentParametersFromShootInfoCMLoading |
      environmentParametersFromKymaInfoCMLoading,
  };
}
