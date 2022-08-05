import React from 'react';
import { useTranslation } from 'react-i18next';
import { isNil } from 'lodash';

import { GenericList } from 'shared/components/GenericList/GenericList';

import { findTypeInSchema, useGetTranslation } from '../helpers';
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

  // const sortingOptions = structure?.sortBy || [];
  const sortPaths = (structure?.children || []).reduce(
    (accumulator, current) => {
      if (accumulator.sortBy) return [...accumulator, current.path];
      return [...accumulator];
    },
    [],
  );
  console.log(sortPaths);
  const sortBy = defaultSort => {
    const obj = {};

    for (const sort of sortPaths) {
      const path = `${structure.path}.${sort}`;
      const type = findTypeInSchema(schema, path);
      console.log('path:', path, 'type:', type);
      obj[tExt(path)] = (a, b) => {
        return a[sort].localeCompare(b[sort]);
      };
    }

    return { ...obj };
  };

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
      sortBy={sortPaths ? sortBy : null}
    />
  );
}
Table.array = true;
