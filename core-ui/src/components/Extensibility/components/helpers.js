import * as jp from 'jsonpath';
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
