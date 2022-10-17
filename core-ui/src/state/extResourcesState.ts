import { atom, RecoilState } from 'recoil';
import { ExtResource } from './types';

type ExtResourcesState = ExtResource[];

const defaultValue: ExtResourcesState = [];

export const extResourcesState: RecoilState<ExtResourcesState> = atom<
  ExtResourcesState
>({
  key: 'extResourcesState',
  default: defaultValue,
});
