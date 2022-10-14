import { atom } from 'recoil';
import { localStorageEffect } from './helpers';

const PAGE_SIZE_STORAGE_KEY = 'busola.dontConfirmDelete';
const DEFAULT_DONT_CONFIRM_DELETE = false;

export const dontConfirmDeleteState = atom<boolean>({
  key: 'dontConfirmDelete',
  default: DEFAULT_DONT_CONFIRM_DELETE,
  effects: [localStorageEffect<boolean>(PAGE_SIZE_STORAGE_KEY)],
});
