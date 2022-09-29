import { isNil } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useGetPlaceholder } from 'components/Extensibility/helpers';

import { Widget } from './Widget';

export function JoinedArray({ value, structure, schema, ...props }) {
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

  const separator = structure?.separator ?? ', ';

  if (separator === 'break') {
    return value.map((val, i) => (
      <p key={i}>
        {structure?.children
          ? structure?.children?.map((def, idx) => (
              <Widget structure={def} value={val} key={idx} {...props} />
            ))
          : val}
      </p>
    ));
  } else if (structure?.children) {
    return (
      <div>
        {value.map((val, i) =>
          structure?.children?.map((def, idx) => (
            <>
              <Widget structure={def} value={val} key={idx} {...props} />
              {i !== value.length - 1 && separator}
            </>
          )),
        )}
      </div>
    );
  } else {
    return value.join(separator) || emptyLeafPlaceholder;
  }
}

JoinedArray.array = true;
JoinedArray.inline = true;
