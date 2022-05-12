import React from 'react';
import { GenericList } from 'shared/components/GenericList/GenericList';
import { getValue, useGetTranslation } from './helpers';
import { isEmpty } from 'lodash';
import { EMPTY_TEXT_PLACEHOLDER } from 'shared/constants';

const prettifyData = value => {
  if (typeof value === 'number' || typeof value === 'string') return value;
  if (typeof value === 'boolean') {
    value = value.toString();
  }

  if (Array.isArray(value)) {
    const arrayString = value.join('\n');
    console.log(arrayString);
    return arrayString;
  }

  if (typeof value === 'object' && value !== null) {
    if (isEmpty(value)) return EMPTY_TEXT_PLACEHOLDER;
  }
};

export const CreateExtensibilityList = metadata => {
  const { title, headers, columns, valuePath } = metadata;

  return res => {
    const result = getValue(res, valuePath);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const translate = useGetTranslation();

    const headerRenderer = () =>
      headers.map(h => {
        return translate(h);
      });

    const rowRenderer = resource => {
      return (
        columns?.map(column =>
          column.split('.').reduce((prevRes, curr) => {
            return prevRes?.[curr] ? prettifyData(prevRes?.[curr]) : null;
          }, resource),
        ) || []
      );
    };

    return (
      <GenericList
        key={translate(title)}
        title={translate(title)}
        showSearchField={false}
        headerRenderer={headerRenderer}
        rowRenderer={rowRenderer}
        entries={result || []}
      />
    );
  };
};
