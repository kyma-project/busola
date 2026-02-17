import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { usePost } from 'shared/hooks/BackendAPI/usePost';
import { useGetYAMLModuleTemplates } from './hooks';

export function useKymaModulesQuery() {
  const kyma = useKymaQuery();
  return {
    loading: kyma.loading,
    modules: kyma.data?.status?.modules || [],
    error: kyma.error,
  };
}

export function useKymaQuery() {
  const {
    data: kymaResources,
    loading: loadingKymaResources,
    error: errorKymaResources,
  } = useGet(
    '/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas',
  );

  const resourceName =
    kymaResources?.items.find((kymaResource) => kymaResource?.status)?.metadata
      .name || kymaResources?.items[0]?.metadata?.name;
  const kymaResourceUrl = `/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas/${resourceName}`;

  const {
    data: kymaResource,
    loading: loadingKyma,
    error: errorKyma,
  } = useGet(kymaResourceUrl, {
    pollingInterval: 3000,
    skip: !resourceName || errorKymaResources,
  });

  return {
    data: kymaResource,
    resourceUrl: kymaResourceUrl,
    error: errorKymaResources || errorKyma,
    loading: loadingKymaResources || loadingKyma,
  };
}

export function useModuleTemplatesQuery({ skip = false }) {
  const modulesResourceUrl = `/apis/operator.kyma-project.io/v1beta2/moduletemplates`;

  const { data, loading } = useGet(modulesResourceUrl, {
    pollingInterval: 3000,
    skip: skip,
  });
  return {
    data,
    loading,
  };
}

export function useExternalCommunityModulesQuery() {
  const communityModulesRepoUrl = `https://kyma-project.github.io/community-modules/all-modules.yaml`;
  const post = usePost();

  const {
    resources: data,
    error,
    loading,
  } = useGetYAMLModuleTemplates(communityModulesRepoUrl, post);

  return { data, loading, error };
}

export function useModulesReleaseQuery({ skip = false }) {
  const modulesReleaseMetaResourceUrl = `/apis/operator.kyma-project.io/v1beta2/modulereleasemetas`;

  const { data, loading } = useGet(modulesReleaseMetaResourceUrl, {
    pollingInterval: 3000,
    skip: skip,
  });

  return { data, loading };
}
