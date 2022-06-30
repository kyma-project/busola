import { isNil } from 'lodash';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';
import { useTranslation } from 'react-i18next';

export function JoinedArray({ value, structure, schema }) {
  const { t } = useTranslation();
  if (isNil(value)) {
    return EMPTY_TEXT_PLACEHOLDER;
  } else if (
    !Array.isArray(value) ||
    value.some(item => Object.keys(item).length > 1)
  ) {
    return t('extensibility.widgets.joined-array.error');
  }

  return value.join(structure.separator ? structure.separator : ', ');
}
