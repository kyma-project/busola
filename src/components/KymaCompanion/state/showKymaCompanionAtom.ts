import { atom, RecoilState } from 'recoil';

export type ShowKymaCompanion = {
  show: boolean;
  fullScreen: boolean;
};

const DEFAULT_SHOW_KYMA_COMPANION: ShowKymaCompanion = {
  show: false,
  fullScreen: false,
};

export const showKymaCompanionState: RecoilState<ShowKymaCompanion> = atom<
  ShowKymaCompanion
>({
  key: 'showKymaCompanionState',
  default: DEFAULT_SHOW_KYMA_COMPANION,
});
