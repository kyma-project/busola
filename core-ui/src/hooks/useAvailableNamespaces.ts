import { isEqual } from 'lodash';
import { useRecoilState, useRecoilValue } from 'recoil';
import { useGetList } from 'shared/hooks/BackendAPI/useGet';
import { useGetHiddenNamespaces } from 'shared/hooks/useGetHiddenNamespaces';
import { namespacesState } from 'state/namespacesAtom';
import { showHiddenNamespacesState } from 'state/preferences/showHiddenNamespacesAtom';
import { K8sResource } from 'types';

type PayloadData = {
  data: {
    items: K8sResource[];
    apiVersion: string;
    kind: string;
  };
};

export function useAvailableNamespaces() {
  const showHiddenNamespaces = useRecoilValue(showHiddenNamespacesState);
  const hiddenNamespaces = useGetHiddenNamespaces();
  const [namespaces, setNamespaces] = useRecoilState(namespacesState);

  const { refetch, silentRefetch } = useGetList()('/api/v1/namespaces', {
    skip: false,
    pollingInterval: 0,
    onDataReceived: (payload: PayloadData) => {
      const filteredNamespaces = payload.data.items
        ?.map(n => n.metadata?.name)
        ?.filter(n => {
          if (showHiddenNamespaces) return true;
          return !hiddenNamespaces.includes(n);
        });
      if (filteredNamespaces && !isEqual(namespaces, filteredNamespaces)) {
        setNamespaces(filteredNamespaces);
      }
    },
  }) as {
    data: Array<K8sResource> | null;
    refetch: VoidFunction;
    silentRefetch: VoidFunction;
  };

  return { namespaces, refetch, silentRefetch };
}
