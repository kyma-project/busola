import { atom, useRecoilValue, useSetRecoilState } from 'recoil';
import { getFetchFn } from './utils/getFetchFn';
import { useEffect, useState } from 'react';
import { clusterState } from './clusterAtom';

export async function useGetKymaResources() {
  const setKymaResources = useSetRecoilState(kymaResourcesAtom);
  const [fetched, setFetched] = useState(false);
  const cluster = useRecoilValue(clusterState);

  let kymas;
  const fetchFn = getFetchFn(useRecoilValue);

  useEffect(() => {
    setFetched(false);
  }, [cluster?.name]);

  if (fetched || !fetchFn) {
    return;
  }

  if (fetchFn) {
    try {
      const response = await fetchFn({
        relativeUrl:
          '/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas',
      });
      kymas = await response.json();
    } catch (e) {
      console.warn('Cannot load cluster params from the target cluster: ', e);
    } finally {
      setFetched(true);
    }
  }
  setKymaResources(kymas);
}

export const kymaResourcesAtom = atom({
  key: 'kymaResourcesAtom',
  default: null,
});
