import { ReadableElapsedTimeFromNow } from 'shared/components/ReadableElapsedTimeFromNow/ReadableElapsedTimeFromNow';
import { useTranslation } from 'react-i18next';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

export function TimeFromNow({ value }) {
  const { t } = useTranslation();

  if (!value || value === EMPTY_TEXT_PLACEHOLDER) {
    return EMPTY_TEXT_PLACEHOLDER;
  }

  return (
    <ReadableElapsedTimeFromNow
      timestamp={value}
      valueUnit={t('common.value-units.days-ago')}
    />
  );
}
