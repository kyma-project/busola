import { isEqual } from 'lodash';
import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useGetHiddenNamespaces } from 'shared/hooks/useGetHiddenNamespaces';
import { activeClusterNameState } from 'state/activeClusterNameAtom';
import { configFeaturesState } from 'state/configFeatures/configFeaturesAtom';
import { namespacesState } from 'state/namespacesAtom';
import { showHiddenNamespacesState } from 'state/preferences/showHiddenNamespacesAtom';
import { K8sResource } from 'state/types';

export function useAvailableNamespaces() {
  const showHiddenNamespaces = useRecoilValue(showHiddenNamespacesState);
  const config = useRecoilValue(configFeaturesState);
  const hiddenNamespaces = useGetHiddenNamespaces();
  const [namespaces, setNamespaces] = useRecoilState(namespacesState);
  const activeCluster = useRecoilValue(activeClusterNameState);

  const { data, refetch } = useGetList()('/api/v1/namespaces', {
    skip: !config?.REACT_NAVIGATION?.isEnabled,
    pollingInterval: 0,
    onDataReceived: () => {},
  }) as {
    data: Array<K8sResource> | null;
    refetch: () => void;
  };

  const filteredNamespaces = data
    ?.map((n: K8sResource) => n.metadata?.name)
    ?.filter(n => {
      if (showHiddenNamespaces) return true;
      return !hiddenNamespaces.includes(n);
    });

  useEffect(() => {
    if (
      filteredNamespaces &&
      !isEqual(namespaces?.[activeCluster], filteredNamespaces)
    ) {
      setNamespaces(prev => ({ ...prev, [activeCluster]: filteredNamespaces }));
    }
  }, [filteredNamespaces, activeCluster, namespaces, setNamespaces]);

  return { namespaces, refetch };
}
