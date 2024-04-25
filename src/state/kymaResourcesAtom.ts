import { atom, useRecoilState } from 'recoil';
import { useGet } from 'shared/hooks/BackendAPI/useGet';

export function useGetKymaResources() {
  const [kymaResources, setKymaResources] = useRecoilState(kymaResourcesAtom);
  const { data } = useGet(
    '/apis/operator.kyma-project.io/v1beta2/namespaces/kyma-system/kymas',
  );

  setKymaResources(data);
  return kymaResources;
}

export const kymaResourcesAtom = atom({
  key: 'kymaResourcesAtom',
  default: null,
});
