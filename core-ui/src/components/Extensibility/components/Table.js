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
        genericErrorMessage: t('extensibility.widgets.table.error'),
      };
    }
  }
};

export function Table({ value, structure, schema, disableMargin }) {
  const { t } = useTranslation();
  const { t: tExt, widgetT } = useGetTranslation();
  const coreHeaders = (structure.children || []).map(column =>
    widgetT([structure, column]),
  );
  const headerRenderer = () =>
    structure.collapsible ? ['', ...coreHeaders] : coreHeaders;

  const rowRenderer = entry => {
    const cells = structure.children.map(column => (
      <Widget value={entry} structure={column} schema={schema} />
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
            />
          ))}
        </td>
      ),
    };
  };

  return (
    <GenericList
      className="extensibility-table"
      showSearchSuggestion={false}
      title={tExt(structure.name, {
        defaultValue: tExt(structure.path, {
          defaultValue: ' ',
        }),
      })}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      disableMargin={disableMargin}
      {...handleTableValue(value, t)}
    />
  );
}
Table.array = true;
