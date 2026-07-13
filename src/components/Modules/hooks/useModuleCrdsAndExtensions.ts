import { useEffect } from 'react';
import { useGet, useGetList } from 'shared/hooks/BackendAPI/useGet';

type ExtensionEntry = {
  metadata: { labels: Record<string, string> };
  data: { general: string };
};

export function useModuleCrdsAndExtensions(
  filterType: 'kyma' | 'community',
  dependencies: any[],
) {
  const filterFn =
    filterType === 'kyma'
      ? (ext: ExtensionEntry) =>
          ext.metadata.labels['app.kubernetes.io/part-of'] === 'Kyma'
      : (ext: ExtensionEntry) =>
          ext.metadata.labels['app.kubernetes.io/part-of'] !== 'Kyma';

  const { data: extensions, silentRefetch: refetchExtensions } = useGetList(
    filterFn,
  )('/api/v1/configmaps?labelSelector=busola.io/extension=resource', {
    pollingInterval: 0,
  } as any);

  const { data: crds, silentRefetch: refetchCrds } = useGet(
    '/apis/apiextensions.k8s.io/v1/customresourcedefinitions',
    { pollingInterval: 0 } as any,
  );

  useEffect(() => {
    refetchExtensions();
    refetchCrds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { extensions, crds };
}
