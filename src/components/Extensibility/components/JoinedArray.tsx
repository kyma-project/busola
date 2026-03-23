import { Fragment } from 'react';
import { isNil } from 'lodash';
import { useTranslation } from 'react-i18next';

import { useGetPlaceholder } from 'components/Extensibility/helpers';

import { Widget } from './Widget';

interface JoinedArrayProps {
  value: any;
  structure: any;
  arrayItems: any[];
  [key: string]: any;
}

export function JoinedArray({
  value,
  structure,
  arrayItems,
  ...props
}: JoinedArrayProps) {
  const { t } = useTranslation();
  const { emptyLeafPlaceholder } = useGetPlaceholder(structure);
  if (isNil(value)) {
    return emptyLeafPlaceholder;
  } else if (
    !Array.isArray(value) ||
    value.some((item) => typeof item === 'object' || Array.isArray(item))
  ) {
    return t('extensibility.widgets.joined-array.error');
  }

  const separator = structure?.separator ?? ', ';
  return (
    <div>
      {separator === 'break'
        ? value.map((val: any, i: number) => (
            <div key={`break-${i}-${val}`}>
              {structure?.children
                ? structure?.children?.map((def: any, idx: number) => (
                    <Widget
                      structure={def}
                      value={val}
                      key={`widget-${def?.path || def?.name || ''}-${idx}`}
                      {...props}
                    />
                  ))
                : val}
            </div>
          ))
        : structure?.children
          ? value.map((val: any, i: number) => (
              <Fragment key={`joined-${i}-${val}`}>
                {structure?.children?.map((def: any, idx: number) => (
                  <Widget
                    structure={def}
                    arrayItems={[...arrayItems, val]}
                    value={val}
                    key={`widget-${def?.path || def?.name || ''}-${idx}`}
                    {...props}
                  />
                ))}
                {i !== value.length - 1 && separator}
              </Fragment>
            ))
          : value.join(separator) || emptyLeafPlaceholder}
    </div>
  );
}

JoinedArray.array = true;
JoinedArray.inline = true;
JoinedArray.copyable = true;
JoinedArray.copyFunction = ({ value, structure }: any) => {
  let separator = structure?.separator ?? ', ';
  separator = separator === 'break' ? '\n' : separator;

  return Array.isArray(value) ? value.join(separator) : '';
};
