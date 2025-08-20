import { atom } from 'jotai';

export type ShowKymaCompanion = {
  show: boolean;
  fullScreen: boolean;
};

const DEFAULT_SHOW_KYMA_COMPANION: ShowKymaCompanion = {
  show: false,
  fullScreen: false,
};

export const showKymaCompanionAtom = atom<ShowKymaCompanion>(
  DEFAULT_SHOW_KYMA_COMPANION,
);
showKymaCompanionAtom.debugLabel = 'showKymaCompanionAtom';
