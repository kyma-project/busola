import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { CONFIG } from 'components/Functions/config.js';

export const useGetBindingsCombined = (func, isActive) => {
  const isBindingUsageForThisFunction = bindingUsage =>
    bindingUsage.spec.usedBy.kind === CONFIG.functionUsageKind &&
    bindingUsage.spec.usedBy.name === func.metadata.name;

  const bindingsRequest = useGetList()(
    `/apis/servicecatalog.k8s.io/v1beta1/namespaces/${func?.metadata.namespace}/servicebindings`,
    {
      pollingInterval: 3100,
      skip: !isActive,
    },
  );

  const bindingUsagesRequest = useGetList()(
    `/apis/servicecatalog.kyma-project.io/v1alpha1/namespaces/${func?.metadata.namespace}/servicebindingusages`,
    {
      pollingInterval: 2900,
      skip: !isActive,
    },
  );

  const secretsRequest = useGetList()(
    `/api/v1/namespaces/${func?.metadata.namespace}/secrets`,
    {
      pollingInterval: 3300,
      skip: !isActive,
    },
  );
  if (
    !bindingsRequest.data ||
    !bindingUsagesRequest.data ||
    !secretsRequest.data
  ) {
    return { serviceBindingsCombined: null, loading: true, error: false };
  }

  const getBindingCombinedData = binding => {
    const usage = bindingUsagesRequest.data.find(
      u =>
        binding.metadata.name === u.spec.serviceBindingRef.name &&
        isBindingUsageForThisFunction(u),
    );
    return {
      serviceBinding: binding,
      serviceBindingUsage: usage,
      secret: binding
        ? secretsRequest.data.find(
            s => s.metadata.name === binding.spec.secretName,
          )
        : undefined,
    };
  };

  const serviceBindingsCombined = bindingsRequest.data.map(
    getBindingCombinedData,
  );

  const error = !!(
    bindingsRequest.error ||
    bindingUsagesRequest.error ||
    secretsRequest.error
  );
  const loading = !!(
    bindingsRequest.loading ||
    bindingUsagesRequest.loading ||
    secretsRequest.loading
  );
  return { serviceBindingsCombined, loading, error };
};
