import { atom, RecoilState, AtomEffect } from 'recoil';
import { localStorageEffect, luigiMessageEffect } from '../utils/effects';

type Theme = 'dark' | 'light' | 'light_dark' | 'hcw' | 'hcb' | 'default';

const THEME_STORAGE_KEY = 'busola.theme';
const DEFAULT_THEME = 'hcb';

function applyThemeToLinkNode(name: Theme, publicUrl: string): any {
  const link = document.querySelector('head #_theme') as HTMLLinkElement;
  if (name === 'light' && link) {
    link.parentNode?.removeChild(link);
  }
  if (!link) {
    addLinkNode();
    return applyThemeToLinkNode(name, publicUrl);
  }

  link.href = `${publicUrl || ''}/themes/${name}.css`;
}

function addLinkNode() {
  const newLink = document.createElement('link');
  newLink.id = '_theme';
  newLink.rel = 'stylesheet';
  document.head.appendChild(newLink);
}
type AddLinkEffect = () => AtomEffect<Theme>;
export const addLinkEffect: AddLinkEffect = () => ({ onSet }) => {
  onSet(newTheme => {
    if (typeof process.env.PUBLIC_URL === 'undefined') return;
    applyThemeToLinkNode(newTheme, process.env.PUBLIC_URL);
  });
};

export const themeState: RecoilState<Theme> = atom<Theme>({
  key: 'themeState',
  default: DEFAULT_THEME,
  effects: [
    localStorageEffect<Theme>(THEME_STORAGE_KEY),
    luigiMessageEffect('busola.luigi-theme', 'name'),
    addLinkEffect(),
  ],
});
