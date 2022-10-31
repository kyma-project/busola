import { useTranslation } from 'react-i18next';

export const useHasTranslations = () => {
  const { i18n, t } = useTranslation();

  // TODO: add proper translations instead of returnObjects
  return (translation: string) =>
    i18n.exists(translation) &&
    typeof t(translation, { returnObjects: true }) !== 'object'
      ? t(translation)
      : translation;
};
