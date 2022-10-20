import { atom, RecoilState } from 'recoil';
import { localStorageEffect } from './helpers';

const DONT_CONFIRM_DELETE_STORAGE_KEY = 'busola.dontConfirmDelete';
const DEFAULT_DONT_CONFIRM_DELETE = false;

export const dontConfirmDeleteState: RecoilState<boolean> = atom<boolean>({
  key: 'dontConfirmDeleteState',
  default: DEFAULT_DONT_CONFIRM_DELETE,
  effects: [localStorageEffect<boolean>(DONT_CONFIRM_DELETE_STORAGE_KEY)],
});
