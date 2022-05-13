import * as jp from 'jsonpath';
import jsyaml from 'js-yaml';
import { useTranslation } from 'react-i18next';

export const getValue = (resource, path) => {
  if (!path || path === '$') return resource;

  if (path.startsWith('$.')) {
    return jp.value(resource, path);
  }
  return jp.value(resource, '$.' + path);
};

export const useGetTranslation = () => {
  const language = useTranslation().i18n.language; //en
  // this fn is cloned in core 'customPaths.js' as 'translate'. Modify it also there
  return translationObj => {
    if (!translationObj) {
      return '';
    }
    if (typeof translationObj === 'string') {
      return translationObj;
    }
    if (translationObj[language]) {
      return translationObj[language];
    }
    return Object.values(translationObj)[0] || '';
  };
};

const getParsedTranslations = translations => {
  try {
    return typeof translations === 'object'
      ? translations
      : jsyaml.load(translations);
  } catch (e) {
    console.log('An error occured while reading translation data', e.message);
    return {};
  }
};

export const useGetTranslation2 = () => {
  const language = useTranslation().i18n.language;

  return (translationText, translationObj) => {
    const parsedTranslationObj = getParsedTranslations(translationObj);
    const translations = parsedTranslationObj?.[language];
    if (!translations || !translationText) {
      return '';
    }
    const translation = jp.value(translations, translationText);
    if (typeof translation === 'string') {
      return translation;
    }
    const array = translationText?.split('.');
    return array[array?.length - 1];
  };
};
