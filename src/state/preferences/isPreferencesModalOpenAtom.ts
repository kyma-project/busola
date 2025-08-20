import { atom } from 'jotai';

const DEFAULT_IS_PREFERENCES_MODAL_OPEN = false;

export const isPreferencesOpenAtom = atom<boolean>(
  DEFAULT_IS_PREFERENCES_MODAL_OPEN,
);
isPreferencesOpenAtom.debugLabel = 'isPreferencesOpenAtom';
