import { atom, RecoilState } from 'recoil';
import { ValidKubeconfig } from 'types';

export interface KubeConfigMultipleState extends ValidKubeconfig {
  chosenContext: string | null;
}

const defaultValue: KubeConfigMultipleState = {
  ...({} as ValidKubeconfig),
  chosenContext: null,
};

export const multipleContexts: RecoilState<KubeConfigMultipleState> =
  atom<KubeConfigMultipleState>({
    key: 'multipleContexts',
    default: defaultValue,
  });
