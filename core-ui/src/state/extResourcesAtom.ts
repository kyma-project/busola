import { atom, RecoilState } from 'recoil';
import { ExtResource } from './types';

export const extResourcesState: RecoilState<ExtResource[]> = atom<
  ExtResource[]
>({
  key: 'extResourcesState',
});
