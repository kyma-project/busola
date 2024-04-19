import { atom, RecoilState, AtomEffect } from 'recoil';
import { localStorageEffect } from '../utils/effects';

export type Theme =
  | 'light_dark'
  | 'sap_horizon'
  | 'sap_horizon_dark'
  | 'sap_horizon_hcw'
  | 'sap_horizon_hcb';

const THEME_STORAGE_KEY = 'busola.theme';
const DEFAULT_THEME = 'light_dark';

export const isSystemThemeDark = () => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export function applyThemeToLinkNode(
  name = 'sap_horizon',
  publicUrl = '',
): any {
  const link = document.querySelector('head #_theme') as HTMLLinkElement;
  if (name === 'sap_horizon' && link) {
    link.parentNode?.removeChild(link);
  }

  if (!link) {
    addLinkNode();
    if (name === 'sap_horizon')
      return applyThemeToLinkNode('default', publicUrl);
    else if (name === 'light_dark')
      return applyThemeToLinkNode(
        isSystemThemeDark() ? 'dark' : 'default',
        publicUrl,
      );
    else return applyThemeToLinkNode(name.slice(12), publicUrl);
  }

  if (name === 'light_dark')
    link.href = `${publicUrl || ''}/themes/${
      isSystemThemeDark() ? 'dark' : 'default'
    }.css`;
  else
    link.href = `${publicUrl || ''}/themes/${
      name === 'sap_horizon' ? 'default' : name
    }.css`;
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
    let themeNew;
    if (newTheme === 'light_dark')
      themeNew = isSystemThemeDark() ? 'dark' : 'default';
    else themeNew = newTheme === 'sap_horizon' ? 'default' : newTheme.slice(12);
    applyThemeToLinkNode(themeNew, process.env.PUBLIC_URL);
  });
};

export const themeState: RecoilState<Theme> = atom<Theme>({
  key: 'themeState',
  default: DEFAULT_THEME,
  effects: [localStorageEffect<Theme>(THEME_STORAGE_KEY), addLinkEffect()],
});
