import * as jp from 'jsonpath';
import { useTranslation } from 'react-i18next';

export const getValue = (resource, path) => {
  if (!path || path === '$') return resource;

  if (path.startsWith('$.')) {
    return jp.value(resource, path);
  }
  return jp.value(resource, '$.' + path);
};

export const useGetTranslation = path => {
  const translationBundle = path || 'extensibility';
  const { t } = useTranslation([translationBundle]); //doesn't always work, add `translationBundle.` at the beggining of a path

  return {
    t: (path, ...props) => t(`${translationBundle}:${path}`, ...props) || path,
  };
};
