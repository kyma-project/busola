import React from 'react';
import { useTranslation } from 'react-i18next';
import { isNil } from 'lodash';

import { GenericList } from 'shared/components/GenericList/GenericList';

import { useGetTranslation } from '../helpers';
import { Widget } from './Widget';

const handleTableValue = (value, t) => {
  switch (true) {
    case isNil(value): {
      return { entries: [] };
    }
    case Array.isArray(value): {
      return {
        entries: value,
      };
    }
    default: {
      return {
        entries: [],
        genericErrorMessage: t('extensibility.widgets.table.error'),
      };
    }
  }
};

export function Table({ value, structure, schema }) {
  const { t } = useTranslation();
  const { t: tExt, widgetT } = useGetTranslation();
  const headerRenderer = () =>
    (structure.children || []).map(column => widgetT([structure, column]));

  const rowRenderer = entry =>
    structure.children.map(column => (
      <Widget value={entry} structure={column} schema={schema} />
    ));

  return (
    <GenericList
      showSearchSuggestion={false}
      title={tExt(structure.name, {
        defaultValue: tExt(structure.path, {
          defaultValue: ' ',
        }),
      })}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      {...handleTableValue(value, t)}
    />
  );
}
Table.array = true;
