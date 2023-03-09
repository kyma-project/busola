import { atom, RecoilState } from 'recoil';
import { localStorageEffect } from '../utils/effects';

export const showDebugonataState: RecoilState<boolean> = atom<boolean>({
  key: 'showDebugonata',
  default: false,
  effects: [localStorageEffect<boolean>('busola.showDebugonata')],
});
