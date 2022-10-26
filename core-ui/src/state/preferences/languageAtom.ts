import { useTranslation } from 'react-i18next';
import { atom, RecoilState, AtomEffect } from 'recoil';
import { localStorageEffect, luigiMessageEffect } from '../utils/effects';

type Language = 'en' | string;

const LANGUAGE_STORAGE_KEY = 'busola.language';
const DEFAULT_LANGUAGE = 'en';

type I18nLanguageEffectFn = () => AtomEffect<string>;

export const i18LanguageEffect: I18nLanguageEffectFn = () => ({ onSet }) => {
  const { i18n } = useTranslation();
  onSet(newLanguage => i18n.changeLanguage(newLanguage));
};

export const disableResourceProtectionState: RecoilState<Language> = atom<
  Language
>({
  key: 'languageState',
  default: DEFAULT_LANGUAGE,
  effects: [
    localStorageEffect<Language>(LANGUAGE_STORAGE_KEY),
    i18LanguageEffect(),
    luigiMessageEffect('busola.language', 'language'),
  ],
});
