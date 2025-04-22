import { atom, useRecoilValue, useSetRecoilState } from 'recoil';
import { getFetchFn } from './utils/getFetchFn';
import { useEffect, useState } from 'react';
import { clusterState } from './clusterAtom';

export async function useGetModuleTemplatesCount() {
  const setModuleTemplates = useSetRecoilState(moduleTemplatesAtom);
  const [fetched, setFetched] = useState(false);
  const cluster = useRecoilValue(clusterState);

  let moduleTemplates;
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
        relativeUrl: '/apis/operator.kyma-project.io/v1beta2/moduletemplates',
      });
      moduleTemplates = await response.json();
    } catch (e) {
      console.warn('Cannot load cluster params from the target cluster: ', e);
    } finally {
      setFetched(true);
    }
  }
  setModuleTemplates(moduleTemplates?.items.length || 0);
}

export const moduleTemplatesAtom = atom({
  key: 'moduleTemplatesAtom',
  default: null,
});
