import { useGet } from 'shared/hooks/BackendAPI/useGet';

export function useGetEnvironmentParameters() {
  const {
    data: environmentParameters,
    loading: environmentParametersLoading,
  } = useGet('/api/v1/namespaces/kyma-system/configmaps/kyma-info');

  const natGatewayIps = environmentParameters?.data[
    'cloud.natGatewayIps'
  ].split(', ');

  return { natGatewayIps, environmentParametersLoading };
}
