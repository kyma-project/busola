import { useEffect } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useGetHiddenNamespaces } from 'shared/hooks/useGetHiddenNamespaces';
import { namespacesAtom } from 'state/namespacesAtom';
import { showHiddenNamespacesAtom } from 'state/preferences/showHiddenNamespacesAtom';
import { K8sResource } from 'types';

export function useAvailableNamespaces() {
  const showHiddenNamespaces = useAtomValue(showHiddenNamespacesAtom);
  const hiddenNamespaces = useGetHiddenNamespaces();
  const [namespaces, setNamespaces] = useAtom(namespacesAtom);

  const { data: allNamespaces, error, refetch, silentRefetch } = useGetList()(
    '/api/v1/namespaces',
    {
      pollingInterval: 3000,
      onDataReceived: () => {},
      skip: false,
    },
  ) as {
    loading: boolean;
    error: any;
    data: Array<K8sResource> | null;
    refetch: VoidFunction;
    silentRefetch: VoidFunction;
  };

  useEffect(() => {
    if (error) {
      setNamespaces(null);
      return;
    }
    const filteredNamespaces = allNamespaces
      ?.map(n => n.metadata?.name)
      ?.filter(n => {
        if (showHiddenNamespaces) return true;
        return !hiddenNamespaces.includes(n);
      });
    if (
      filteredNamespaces &&
      JSON.stringify(filteredNamespaces) !== JSON.stringify(namespaces)
    ) {
      setNamespaces(filteredNamespaces);
    }
  }, [
    allNamespaces,
    error,
    hiddenNamespaces,
    setNamespaces,
    showHiddenNamespaces,
    namespaces,
  ]);

  return { namespaces, refetch, silentRefetch, setNamespaces };
}
