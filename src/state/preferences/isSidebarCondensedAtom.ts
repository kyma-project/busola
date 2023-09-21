import { atom, RecoilState, AtomEffect } from 'recoil';

type IsSidebarCondensed = boolean;

const DEFAULT_IS_SIDEBAR_CONDENSED = false;

type AddLinkEffect = () => AtomEffect<IsSidebarCondensed>;

export const changeSidebarWidthEffect: AddLinkEffect = () => ({ onSet }) => {
  const sidebarCondensedWidth = '52px';
  const sidebarOpenedWidth = '16rem';

  onSet(isCondensed => {
    const root: HTMLElement = document.querySelector(':root')!;
    if (isCondensed) {
      root.style.setProperty('--sidebar-width', sidebarCondensedWidth);
    } else {
      root.style.setProperty('--sidebar-width', sidebarOpenedWidth);
    }
  });
};

export const isSidebarCondensedState: RecoilState<IsSidebarCondensed> = atom<
  IsSidebarCondensed
>({
  key: 'isSidebarCondensedState',
  default: DEFAULT_IS_SIDEBAR_CONDENSED,
  effects: [changeSidebarWidthEffect()],
});
