import { atom, RecoilState, AtomEffect } from 'recoil';

type IsSidebarCondensed = boolean;

const DEFAULT_DISABLE_RESOURCE_PROTECTION = false;

type AddLinkEffect = () => AtomEffect<IsSidebarCondensed>;

export const changeSidebarWidthEffect: AddLinkEffect = () => ({ onSet }) => {
  onSet(isCondensed => {
    const root: HTMLElement = document.querySelector(':root')!;
    if (isCondensed) {
      root!.style.setProperty('--sidebar-width', '60px');
    } else {
      root!.style.setProperty('--sidebar-width', '260px');
    }
  });
};

export const isSidebarCondensedState: RecoilState<IsSidebarCondensed> = atom<
  IsSidebarCondensed
>({
  key: 'isSidebarCondensedState',
  default: DEFAULT_DISABLE_RESOURCE_PROTECTION,
  effects: [changeSidebarWidthEffect()],
});
