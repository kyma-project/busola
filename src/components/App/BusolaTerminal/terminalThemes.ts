import { ITheme } from '@xterm/xterm';
import { Theme, isSystemThemeDark } from 'state/settings/themeAtom';

const LIGHT_XTERM_THEME: ITheme = {
  background: '#f5f6f7',
  foreground: '#131e29',
  cursor: '#0064d9',
  cursorAccent: '#f5f6f7',
  selectionBackground: '#0064d980',
};

const DARK_XTERM_THEME: ITheme = {
  background: '#12171c',
  foreground: '#f5f6f7',
  cursor: '#4db1ff',
  cursorAccent: '#12171c',
  selectionBackground: '#4db1ff80',
};

const HCB_XTERM_THEME: ITheme = {
  background: '#000000',
  foreground: '#ffffff',
  cursor: '#ffffff',
  cursorAccent: '#000000',
  selectionBackground: '#ffffff40',
};

const HCW_XTERM_THEME: ITheme = {
  background: '#ffffff',
  foreground: '#000000',
  cursor: '#000000',
  cursorAccent: '#ffffff',
  selectionBackground: '#00000040',
};

export function getXtermTheme(theme: Theme): ITheme {
  switch (theme) {
    case 'sap_horizon_dark':
      return DARK_XTERM_THEME;
    case 'sap_horizon_hcb':
      return HCB_XTERM_THEME;
    case 'sap_horizon_hcw':
      return HCW_XTERM_THEME;
    case 'light_dark':
      return isSystemThemeDark() ? DARK_XTERM_THEME : LIGHT_XTERM_THEME;
    default:
      return LIGHT_XTERM_THEME;
  }
}
