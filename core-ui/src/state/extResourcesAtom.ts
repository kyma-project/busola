import { atom, RecoilState } from 'recoil';
import { ExtResource } from './types';

type ExtResourcesAtom = ExtResource[];

export const extResourcesState: RecoilState<ExtResourcesAtom> = atom<
  ExtResourcesAtom
>({
  key: 'extResourcesState',
});
