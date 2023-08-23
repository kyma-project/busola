import { atom, RecoilState } from 'recoil';
import { localStorageEffect } from '../utils/effects';

export type Theme =
  | 'sap_horizon'
  | 'sap_horizon_dark'
  | 'sap_horizon_hcw'
  | 'sap_horizon_hcb';

const THEME_STORAGE_KEY = 'busola.theme';
const DEFAULT_THEME = 'sap_horizon';

export const themeState: RecoilState<Theme> = atom<Theme>({
  key: 'themeState',
  default: DEFAULT_THEME,
  effects: [localStorageEffect<Theme>(THEME_STORAGE_KEY)],
});
