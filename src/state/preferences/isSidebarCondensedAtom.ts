import { atom } from 'jotai';

const DEFAULT_IS_SIDEBAR_CONDENSED = false;

export const isSidebarCondensedState = atom<boolean>(
  DEFAULT_IS_SIDEBAR_CONDENSED,
);
isSidebarCondensedState.debugLabel = 'isSidebarCondensedState';
