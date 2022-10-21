import { atom, RecoilState } from 'recoil';
import { ExtResource } from './types';

type ExtResourcesAtom = ExtResource[] | null;

const defaultValue: ExtResourcesAtom = null;

export const extResourcesState: RecoilState<ExtResourcesAtom> = atom<
  ExtResourcesAtom
>({
  key: 'extResourcesState',
  default: defaultValue,
});
