import { atom, RecoilState, AtomEffect } from 'recoil';
import { localStorageEffect } from '../utils/effects';

export type Theme =
  | 'sap_horizon'
  | 'sap_horizon_dark'
  | 'sap_horizon_hcw'
  | 'sap_horizon_hcb';

const THEME_STORAGE_KEY = 'busola.theme';
const DEFAULT_THEME = 'sap_horizon';

export function applyThemeToLinkNode(
  name = 'sap_horizon',
  publicUrl = '',
): any {
  const link = document.querySelector('head #_theme') as HTMLLinkElement;
  console.log(link, publicUrl);
  if (name === 'sap_horizon' && link) {
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
export const addLinkEffect: AddLinkEffect = () => ({ onSet, setSelf }) => {
  setSelf(param => {
    const defaultValue = param as Theme;
    applyThemeToLinkNode(defaultValue, process.env.PUBLIC_URL);
    return defaultValue;
  });

  onSet(newTheme => {
    applyThemeToLinkNode(newTheme, process.env.PUBLIC_URL);
  });
};

export const themeState: RecoilState<Theme> = atom<Theme>({
  key: 'themeState',
  default: DEFAULT_THEME,
  effects: [localStorageEffect<Theme>(THEME_STORAGE_KEY)],
});
