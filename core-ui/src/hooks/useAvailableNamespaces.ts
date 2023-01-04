import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useGetHiddenNamespaces } from 'shared/hooks/useGetHiddenNamespaces';
import { namespacesState } from 'state/namespacesAtom';
import { showHiddenNamespacesState } from 'state/preferences/showHiddenNamespacesAtom';
import { K8sResource } from 'types';

// type PayloadData = {
//   data: {
//     items: K8sResource[];
//     apiVersion: string;
//     kind: string;
//   };
// };

export function useAvailableNamespaces() {
  const showHiddenNamespaces = useRecoilValue(showHiddenNamespacesState);
  const hiddenNamespaces = useGetHiddenNamespaces();
  const [namespaces, setNamespaces] = useRecoilState(namespacesState);

  const { data, refetch, silentRefetch } = useGetList()('/api/v1/namespaces', {
    skip: false,
    pollingInterval: 0,
    onDataReceived: () => {},

    // onDataReceived: () => {},
    // onDataReceived: (payload: PayloadData) => {
    //   const filteredNamespaces = payload.data.items
    //     ?.map(n => n.metadata?.name)
    //     ?.filter(n => {
    //       if (showHiddenNamespaces) return true;
    //       return !hiddenNamespaces.includes(n);
    //     });
    //   setNamespaces(filteredNamespaces);
    // },
  }) as {
    loading: boolean;
    error: any;
    data: Array<K8sResource> | null;
    refetch: VoidFunction;
    silentRefetch: VoidFunction;
  };

  useEffect(() => {
    const filteredNamespaces = data
      ?.map(n => n.metadata?.name)
      ?.filter(n => {
        if (showHiddenNamespaces) return true;
        return !hiddenNamespaces.includes(n);
      });
    if (filteredNamespaces) {
      console.log({ filteredNamespaces });
      setNamespaces(filteredNamespaces);
    }
  }, [data, hiddenNamespaces, setNamespaces, showHiddenNamespaces]);

  return { namespaces, refetch, silentRefetch, setNamespaces };
}
