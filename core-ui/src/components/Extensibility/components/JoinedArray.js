import { isNil } from 'lodash';
import { useTranslation } from 'react-i18next';
import { useGetPlaceholder } from 'components/Extensibility/helpers';

export function JoinedArray({ value, structure, schema }) {
  const { t } = useTranslation();
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);
  if (isNil(value)) {
    return emptyLeafPlaceholder;
  } else if (
    !Array.isArray(value) ||
    value.some(item => typeof item === 'object' || Array.isArray(item))
  ) {
    return t('extensibility.widgets.joined-array.error');
  }

  if (structure?.separator === 'break') {
    return value.map((val, i) => <p key={i}>{val}</p>);
  } else {
    return (
      value.join(structure?.separator ? structure.separator : ', ') ||
      emptyLeafPlaceholder
    );
  }
}

JoinedArray.array = true;
JoinedArray.inline = true;
