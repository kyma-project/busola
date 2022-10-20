import { atom, RecoilState } from 'recoil';
import { localStorageEffect } from './helpers';

type PageSize = number;

const PAGE_SIZE_STORAGE_KEY = 'busola.page-size';
const DEFAULT_PAGE_SIZE = 20;

export const pageSizeState: RecoilState<PageSize> = atom<PageSize>({
  key: 'pageSizeState',
  default: DEFAULT_PAGE_SIZE,
  effects: [localStorageEffect<PageSize>(PAGE_SIZE_STORAGE_KEY)],
});
