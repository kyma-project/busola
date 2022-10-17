import { atom, RecoilState } from 'recoil';
import { ExtResource } from './types';

type ExtResourcesAtom = ExtResource[];

const defaultValue: ExtResourcesAtom = [];

export const extResourcesState: RecoilState<ExtResourcesAtom> = atom<
  ExtResourcesAtom
>({
  key: 'extResourcesState',
  default: defaultValue,
});
