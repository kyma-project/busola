import { atom } from 'jotai';
import { ValidKubeconfig } from 'types';

export interface KubeConfigMultipleState extends ValidKubeconfig {
  chosenContext: string | null;
}

const defaultValue: KubeConfigMultipleState = {
  ...({} as ValidKubeconfig),
  chosenContext: null,
};

export const multipleContextsAtom = atom<KubeConfigMultipleState>(defaultValue);
multipleContextsAtom.debugLabel = 'multipleContextsAtom';
