import { useGet } from 'shared/hooks/BackendAPI/useGet';

export function useKymaModulesQuery(skip = false) {
  const {
    data: kymaResources,
    loading: loadingKymaResources,
    error: errorKymaResources,
  } = useGet(
    '/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas',
  );

  const resourceName =
    kymaResources?.items.find(kymaResource => kymaResource?.status)?.metadata
      .name || kymaResources?.items[0]?.metadata?.name;
  const kymaResourceUrl = `/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas/${resourceName}`;

  const { data: kymaResource, loading: loadingKyma, error: errorKyma } = useGet(
    kymaResourceUrl,
    {
      pollingInterval: 3000,
      skip: !resourceName || errorKymaResources,
    },
  );

  return {
    modules: kymaResource?.status?.modules || [],
    error: errorKymaResources || errorKyma,
    loading: loadingKymaResources || loadingKyma,
  };
}
