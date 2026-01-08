import { atom } from 'jotai';

const DEFAULT_IS_SIDEBAR_CONDENSED = false;

export const isSidebarCondensedAtom = atom<boolean>(
  DEFAULT_IS_SIDEBAR_CONDENSED,
);
isSidebarCondensedAtom.debugLabel = 'isSidebarCondensedAtom';
