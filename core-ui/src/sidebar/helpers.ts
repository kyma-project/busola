import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export const useHasTranslations = () => {
  const { i18n, t } = useTranslation();

  const hasTranslations = useCallback(
    (translation: string) => {
      return i18n.exists(translation) &&
        typeof t(translation, { returnObjects: true }) !== 'object'
        ? t(translation)
        : translation;
    },
    [i18n, t],
  );

  // TODO: add proper translations instead of returnObjects
  return hasTranslations;
};
