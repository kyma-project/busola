import { atom, RecoilState } from 'recoil';
import { localStorageEffect } from '../utils/effects';

type DontConfirmDelete = boolean;

const DONT_CONFIRM_DELETE_STORAGE_KEY = 'busola.dontConfirmDelete';
const DEFAULT_DONT_CONFIRM_DELETE = false;

export const dontConfirmDeleteState: RecoilState<DontConfirmDelete> = atom<
  DontConfirmDelete
>({
  key: 'dontConfirmDeleteState',
  default: DEFAULT_DONT_CONFIRM_DELETE,
  effects: [
    localStorageEffect<DontConfirmDelete>(DONT_CONFIRM_DELETE_STORAGE_KEY),
  ],
});
