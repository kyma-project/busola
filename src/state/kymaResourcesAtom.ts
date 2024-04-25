import { atom, useRecoilValue, useSetRecoilState } from 'recoil';
import { getFetchFn } from './utils/getFetchFn';

export async function useGetKymaResources() {
  const setKymaResources = useSetRecoilState(kymaResourcesAtom);
  let kymas;
  const fetchFn = getFetchFn(useRecoilValue);
  if (fetchFn) {
    try {
      const response = await fetchFn({
        relativeUrl:
          '/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas',
      });
      kymas = await response.json();
    } catch (e) {
      console.warn('Cannot load cluster params from the target cluster: ', e);
    }
  }
  setKymaResources(kymas);
}

export const kymaResourcesAtom = atom({
  key: 'kymaResourcesAtom',
  default: null,
});
