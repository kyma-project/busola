import React from 'react';

import { GenericList } from 'shared/components/GenericList/GenericList';

import { useGetTranslation } from '../helpers';
import { Widget } from './Widget';

export function Table({ value, structure, schema }) {
  const { t } = useGetTranslation();

  const key = structure.name || structure.path;
  const headerRenderer = () =>
    (structure.columns || structure.children || []).map(column =>
      t(`${key}.${column.name || column.path}`),
    );

  const rowRenderer = entry =>
    structure.columns.map(column => (
      <Widget value={entry} structure={column} schema={schema} />
    ));

  return (
    <GenericList
      showSearchSuggestion={false}
      entries={value || []}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
    />
  );
}
Table.array = true;
