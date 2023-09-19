import { isNil } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useGetPlaceholder } from 'components/Extensibility/helpers';

import { Widget } from './Widget';

export function JoinedArray({
  value,
  structure,
  schema,
  arrayItems,
  ...props
}) {
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
  return (
    <div>
      {separator === 'break'
        ? value.map((val, i) => (
            <div key={i}>
              {structure?.children
                ? structure?.children?.map((def, idx) => (
                    <Widget structure={def} value={val} key={idx} {...props} />
                  ))
                : val}
            </div>
          ))
        : structure?.children
        ? value.map((val, i) => (
            <>
              {structure?.children?.map((def, idx) => (
                <Widget
                  structure={def}
                  arrayItems={[...arrayItems, val]}
                  value={val}
                  key={idx}
                  {...props}
                />
              ))}
              {i !== value.length - 1 && separator}
            </>
          ))
        : value.join(separator) || emptyLeafPlaceholder}
    </div>
  );
}

JoinedArray.array = true;
JoinedArray.inline = true;
JoinedArray.copyable = true;
JoinedArray.copyFunction = ({ value, structure }) => {
  let separator = structure?.separator ?? ', ';
  separator = separator === 'break' ? '\n' : separator;

  return Array.isArray(value) ? value.join(separator) : '';
};
