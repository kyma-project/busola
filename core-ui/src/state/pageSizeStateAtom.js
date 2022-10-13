import { atom } from 'recoil';
import { localStorageEffect } from './helpers';

const PAGE_SIZE_STORAGE_KEY = 'busola.page-size';
const DEFAULT_PAGE_SIZE = 20;
export const AVAILABLE_PAGE_SIZES = [10, 20, 50];

export const pageSizeState = atom({
  key: 'pageSizeState',
  default: DEFAULT_PAGE_SIZE,
  effects: [localStorageEffect(PAGE_SIZE_STORAGE_KEY)],
});
