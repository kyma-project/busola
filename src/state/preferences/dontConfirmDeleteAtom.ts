import { atomWithStorage } from 'jotai/utils';

const DONT_CONFIRM_DELETE_STORAGE_KEY = 'busola.dontConfirmDelete';
const DEFAULT_DONT_CONFIRM_DELETE = false;

export const dontConfirmDeleteState = atomWithStorage<boolean>(
  DONT_CONFIRM_DELETE_STORAGE_KEY,
  DEFAULT_DONT_CONFIRM_DELETE,
);
dontConfirmDeleteState.debugLabel = 'dontConfirmDeleteState';
