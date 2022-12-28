import { isEqual } from 'lodash';
import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useGetHiddenNamespaces } from 'shared/hooks/useGetHiddenNamespaces';
import { namespacesState } from 'state/namespacesAtom';
import { showHiddenNamespacesState } from 'state/preferences/showHiddenNamespacesAtom';
import { K8sResource } from 'types';

export function useAvailableNamespaces(skipCall?: boolean) {
  const showHiddenNamespaces = useRecoilValue(showHiddenNamespacesState);
  const hiddenNamespaces = useGetHiddenNamespaces();
  const [namespaces, setNamespaces] = useRecoilState(namespacesState);

  const { data, refetch } = useGetList()('/api/v1/namespaces', {
    skip: skipCall,
    pollingInterval: 0,
    onDataReceived: () => {},
  }) as {
    data: Array<K8sResource> | null;
    refetch: VoidFunction;
  };

  const namespaceFilter = () => (namespaceName: string) => {
    if (showHiddenNamespaces) return true;
    return !hiddenNamespaces.includes(namespaceName);
  };

  const prepareFetchedNamespaces = (namespaces: Array<K8sResource> | null) => {
    return namespaces?.map(n => n.metadata?.name);
  };

  const filteredNamespaces = (skipCall
    ? namespaces
    : prepareFetchedNamespaces(data)
  )?.filter(namespaceFilter);

  useEffect(() => {
    if (filteredNamespaces && !isEqual(namespaces, filteredNamespaces)) {
      setNamespaces(filteredNamespaces);
    }
  }, [filteredNamespaces, namespaces, setNamespaces]);

  return { namespaces, refetch };
}
