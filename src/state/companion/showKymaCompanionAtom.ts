import { atom } from 'jotai';

const DEFAULT_SHOW_KYMA_COMPANION: boolean = false;

export const showKymaCompanionAtom = atom<boolean>(DEFAULT_SHOW_KYMA_COMPANION);
showKymaCompanionAtom.debugLabel = 'showKymaCompanionAtom';
