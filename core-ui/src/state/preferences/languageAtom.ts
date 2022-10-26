import LuigiClient from '@luigi-project/client';
import { atom, RecoilState, AtomEffect } from 'recoil';

type Language = 'en' | string;

const LANGUAGE_STORAGE_KEY = 'busola.language';
const DEFAULT_LANGUAGE = 'en';

type LanguageEffectFn = () => AtomEffect<string>;

export const languageEffect: LanguageEffectFn = () => ({ onSet, setSelf }) => {
  setSelf(() => {
    const savedValue = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en';
    const initListenerId = LuigiClient.addInitListener(_ => {
      LuigiClient.sendCustomMessage({
        id: 'busola.language',
        language: JSON.parse(savedValue),
      });
      console.log('inside', LuigiClient.isLuigiClientInitialized());
      LuigiClient.removeInitListener(initListenerId);
    });

    return JSON.parse(savedValue);
  });

  onSet(newLanguage => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, JSON.stringify(newLanguage));

    LuigiClient.sendCustomMessage({
      id: 'busola.language',
      language: newLanguage,
    });
  });
};

export const languageAtom: RecoilState<Language> = atom<Language>({
  key: 'languageState',
  default: DEFAULT_LANGUAGE,
  effects: [languageEffect()],
});
