import { atom, RecoilState } from 'recoil';
import { localStorageEffect } from './helpers';

const PAGE_SIZE_STORAGE_KEY = 'busola.page-size';
const DEFAULT_PAGE_SIZE = 20;

export const pageSizeState: RecoilState<number> = atom<number>({
  key: 'pageSizeState',
  default: DEFAULT_PAGE_SIZE,
  effects: [localStorageEffect<number>(PAGE_SIZE_STORAGE_KEY)],
});
