import { atom } from 'jotai';

export type ShowKymaCompanion = {
  show: boolean;
  fullScreen: boolean;
  useJoule: boolean;
};

const DEFAULT_SHOW_KYMA_COMPANION: ShowKymaCompanion = {
  show: false,
  fullScreen: false,
  useJoule: false,
};

export const showKymaCompanionAtom = atom<ShowKymaCompanion>(
  DEFAULT_SHOW_KYMA_COMPANION,
);
showKymaCompanionAtom.debugLabel = 'showKymaCompanionAtom';
