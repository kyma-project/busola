import { luigiMessageEffect } from './../utils/effects';
import { atom, RecoilState } from 'recoil';
import { localStorageEffect } from 'state/utils/effects';

type Language = string;

const LANGUAGE_STORAGE_KEY = 'busola.language';
const DEFAULT_LANGUAGE = 'en';

export const languageAtom: RecoilState<Language> = atom<Language>({
  key: 'languageState',
  default: DEFAULT_LANGUAGE,
  effects: [
    localStorageEffect(LANGUAGE_STORAGE_KEY),
    luigiMessageEffect('busola.language', 'language'),
  ],
});
