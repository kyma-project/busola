import React from 'react';
import { useTranslation } from 'react-i18next';
import { isNil } from 'lodash';
import { useGetSchema } from 'hooks/useGetSchema';

import { GenericList } from 'shared/components/GenericList/GenericList';

import { useGetTranslation } from '../helpers';
import { Widget, InlineWidget } from './Widget';

import './Table.scss';

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

export function Table({ value, structure, disableMargin, schema, ...props }) {
  const { t } = useTranslation();
  const { t: tExt } = useGetTranslation();
  const coreHeaders = (structure.children || []).map(column => {
    const path = `${structure.path}.${column.path}`;
    return tExt(path);
  });
  const headerRenderer = () =>
    structure.collapsible ? ['', ...coreHeaders] : coreHeaders;

  const rowRenderer = entry => {
    const cells = (structure.children || []).map(column => (
      <Widget value={entry} structure={column} schema={schema} {...props} />
    ));

    if (!structure.collapsible) {
      return cells;
    }

    return {
      cells,
      collapseContent: (
        <td colspan="100%" className="collapsible-panel">
          {structure.collapsible.map(child => (
            <Widget
              value={entry}
              structure={child}
              schema={schema}
              inlineRenderer={InlineWidget}
              {...props}
            />
          ))}
        </td>
      ),
    };
  };

  const sortByArray = structure?.sortBy;

  const sortingOptions = defaultSort => {
    const obj = {};

    for (const sort of sortByArray || []) {
      obj[tExt(`${structure.path}.${sort}`)] = (a, b) => {
        console.log('a', a);
        console.log('b', b);
        return a[sort] - b[sort];
      };
    }
    return { ...obj };
  };

  console.log('schema', schema);
  console.log('props', props);

  return (
    <GenericList
      className="extensibility-table"
      showSearchSuggestion={false}
      title={tExt(structure.name, {
        defaultValue: tExt(structure.path, {
          defaultValue: structure.name,
        }),
      })}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      disableMargin={disableMargin}
      {...handleTableValue(value, t)}
      sortBy={sortingOptions}
      customSortNames
    />
  );
}
Table.array = true;
