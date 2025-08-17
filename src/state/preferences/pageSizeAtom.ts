import { atomWithStorage } from 'jotai/utils';

const PAGE_SIZE_STORAGE_KEY = 'busola.page-size';
const DEFAULT_PAGE_SIZE = 20;

export const AVAILABLE_PAGE_SIZES = [10, 20, 50];

export const pageSizeState = atomWithStorage<number>(
  PAGE_SIZE_STORAGE_KEY,
  DEFAULT_PAGE_SIZE,
);
pageSizeState.debugLabel = 'pageSizeState';
