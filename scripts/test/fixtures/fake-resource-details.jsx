/* eslint-disable */
import { useTranslation } from 'react-i18next';

export const i18nDescriptionKey = 'translation.description-key.used';

export const category = {
  label: 'translation.nav-label.used',
  pathSegment: 'example',
};

export function ResourceDetails({ section }) {
  const { t } = useTranslation();

  const extLabel = tExt(`translation.text-variant.used`);

  return (
    <ResourceForm>
      <Description i18nKey={i18nDescriptionKey} />
      <span>{extLabel}</span>
    </ResourceForm>
  );
}
