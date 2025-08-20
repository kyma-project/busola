import { atomWithStorage } from 'jotai/utils';

const LANGUAGE_STORAGE_KEY = 'busola.language';
const DEFAULT_LANGUAGE = 'en';

export const languageAtom = atomWithStorage<string>(
  LANGUAGE_STORAGE_KEY,
  DEFAULT_LANGUAGE,
);
languageAtom.debugLabel = 'languageAtom';
