import React from 'react';
import { useTranslation } from 'react-i18next';
import { isNil } from 'lodash';

import { GenericList } from 'shared/components/GenericList/GenericList';

import { sortBy, useGetTranslation } from '../helpers';
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

export function Table({
  value,
  structure,
  disableMargin,
  schema,
  originalResource,
  ...props
}) {
  const { t } = useTranslation();
  const { t: tExt } = useGetTranslation();

  const coreHeaders = (structure.children || []).map(({ name }) => tExt(name));
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

  const sortOptions = (structure?.children || []).filter(child => child.sort);

  return (
    <GenericList
      className="extensibility-table"
      showSearchSuggestion={false}
      title={tExt(structure.name, {
        defaultValue: structure.name || structure.source,
      })}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      disableMargin={disableMargin}
      {...handleTableValue(value, t)}
      sortBy={() => sortBy(sortOptions, tExt, {}, originalResource)}
    />
  );
}
Table.array = true;
