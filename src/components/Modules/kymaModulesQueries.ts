import { useGet } from 'shared/hooks/BackendAPI/useGet';
import { useGetYAMLModuleTemplates } from './hooks';
import { useMemo } from 'react';
import {
  KymaResourceStatusModuleType,
  KymaResourceType,
  ModuleReleaseMetaListType,
  ModuleTemplateType,
} from './support';

export function useKymaModulesQuery() {
  const kyma = useKymaQuery() as {
    data: { status: { modules: KymaResourceStatusModuleType[] } } | null;
    loading: boolean;
    error: Error | null;
  };
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
  ) as {
    data: { items: KymaResourceType[] } | null;
    loading: boolean;
    error: Error | null;
  };

  const resourceName = useMemo(
    () =>
      kymaResources?.items.find((kymaResource) => kymaResource?.status)
        ?.metadata.name || kymaResources?.items[0]?.metadata?.name,
    [kymaResources],
  );

  const kymaResourceUrl = `/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas/${resourceName}`;

  const {
    data: kymaResource,
    loading: loadingKyma,
    error: errorKyma,
  } = useGet(kymaResourceUrl, {
    //@ts-expect-error - mismatch between JS and TS
    pollingInterval: 3000,
    skip: !!(!resourceName || errorKymaResources),
  });

  return {
    data: kymaResource as KymaResourceType | null,
    resourceUrl: kymaResourceUrl,
    error: errorKymaResources || errorKyma,
    loading: loadingKymaResources || loadingKyma,
  };
}

export function useModuleTemplatesQuery({ skip = false }) {
  const modulesResourceUrl = `/apis/operator.kyma-project.io/v1beta2/moduletemplates`;

  const { data, loading } = useGet(modulesResourceUrl, {
    //@ts-expect-error - mismatch between JS and TS
    pollingInterval: 3000,
    skip: skip,
  }) as {
    data: { items: ModuleTemplateType[] } | null;
    loading: boolean;
  };
  return {
    data,
    loading,
  };
}

export function useExternalCommunityModulesQuery() {
  const communityModulesRepoUrl = `https://kyma-project.github.io/community-modules/all-modules.yaml`;

  const {
    resources: data,
    error,
    loading,
  } = useGetYAMLModuleTemplates(communityModulesRepoUrl);

  return { data, loading, error };
}

export function useModulesReleaseQuery({ skip = false }) {
  const modulesReleaseMetaResourceUrl = `/apis/operator.kyma-project.io/v1beta2/modulereleasemetas`;

  const { data, loading } = useGet(modulesReleaseMetaResourceUrl, {
    //@ts-expect-error - mismatch between JS and TS
    pollingInterval: 3000,
    skip: skip,
  }) as { data: ModuleReleaseMetaListType | null; loading: boolean };

  return { data, loading };
}
