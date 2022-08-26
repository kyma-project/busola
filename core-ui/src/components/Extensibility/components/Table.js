import React from 'react';
import { useTranslation } from 'react-i18next';
import { isNil } from 'lodash';

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
        notFoundMessage: t('extensibility.widgets.table.error'),
      };
    }
  }
};

export function Table({ value, structure, schema, disableMargin, ...props }) {
  console.log(value, structure);
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

  const className = `extensibility-table ${
    disableMargin ? 'fd-margin--xs' : ''
  }`;

  return (
    <GenericList
      className={className}
      title={tExt(structure.name, {
        defaultValue: tExt(structure.path, {
          defaultValue: structure.name,
        }),
      })}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      {...handleTableValue(value, t)}
      searchSettings={{ showSearchSuggestion: false }}
    />
  );
}
Table.array = true;
