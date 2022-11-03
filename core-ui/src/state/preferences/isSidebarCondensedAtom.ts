import { atom, RecoilState } from 'recoil';

type IsSidebarCondensed = boolean;

const DEFAULT_DISABLE_RESOURCE_PROTECTION = false;

export const isSidebarCondensedState: RecoilState<IsSidebarCondensed> = atom<
  IsSidebarCondensed
>({
  key: 'isSidebarCondensedState',
  default: DEFAULT_DISABLE_RESOURCE_PROTECTION,
});
