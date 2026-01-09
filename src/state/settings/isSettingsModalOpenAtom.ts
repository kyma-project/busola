import { atom } from 'jotai';

const DEFAULT_IS_SETTINGS_MODAL_OPEN = false;

export const isSettingsOpenAtom = atom<boolean>(DEFAULT_IS_SETTINGS_MODAL_OPEN);
isSettingsOpenAtom.debugLabel = 'isSettingsOpenAtom';
