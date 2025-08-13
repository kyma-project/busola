import { atom } from 'jotai';

const DEFAULT_IS_PREFERENCES_MODAL_OPEN = false;

export const isPreferencesOpenState = atom<boolean>(
  DEFAULT_IS_PREFERENCES_MODAL_OPEN,
);
isPreferencesOpenState.debugLabel = 'isPreferencesModalOpenedState';
