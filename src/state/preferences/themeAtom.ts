import { atomWithStorage } from 'jotai/utils';

export type Theme =
  | 'light_dark'
  | 'sap_horizon'
  | 'sap_horizon_dark'
  | 'sap_horizon_hcw'
  | 'sap_horizon_hcb';

const THEME_STORAGE_KEY = 'busola.theme';
const DEFAULT_THEME = 'light_dark';

export const isCurrentThemeDark = (theme: Theme) => {
  return (
    (theme === 'light_dark' && isSystemThemeDark()) ||
    theme === 'sap_horizon_dark' ||
    theme === 'sap_horizon_hcb'
  );
};

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

export const themeState = atomWithStorage<Theme>(
  THEME_STORAGE_KEY,
  DEFAULT_THEME,
);
themeState.debugLabel = 'themeState';
