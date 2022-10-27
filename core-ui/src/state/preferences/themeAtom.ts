import { atom, RecoilState } from 'recoil';
import { localStorageEffect, luigiMessageEffect } from '../utils/effects';

type Theme = 'dark' | 'light' | 'light_dark' | 'hcw' | 'hcb';

const THEME_STORAGE_KEY = 'busola.theme';
const DEFAULT_THEME = 'light_dark';

export const themeState: RecoilState<Theme> = atom<Theme>({
  key: 'themeState',
  default: DEFAULT_THEME,
  effects: [
    localStorageEffect<Theme>(THEME_STORAGE_KEY),
    luigiMessageEffect('busola.luigi-theme', 'name'),
  ],
});
