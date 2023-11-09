import { atom, RecoilState, AtomEffect } from 'recoil';

type IsSidebarCondensed = boolean;

const DEFAULT_IS_SIDEBAR_CONDENSED = false;

export const isSidebarCondensedState: RecoilState<IsSidebarCondensed> = atom<
  IsSidebarCondensed
>({
  key: 'isSidebarCondensedState',
  default: DEFAULT_IS_SIDEBAR_CONDENSED,
});
