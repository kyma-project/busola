import React from 'react';
import { useTranslation } from 'react-i18next';
import { isNil } from 'lodash';
import classNames from 'classnames';

import { GenericList } from 'shared/components/GenericList/GenericList';

import { sortBy, useGetTranslation } from '../helpers';
import { Widget, InlineWidget } from './Widget';

import './Table.scss';
import { jsonataWrapper } from '../helpers/jsonataWrapper';

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

  const tdClassNames = classNames({
    'collapsible-panel': !structure.disablePadding,
  });

  const rowRenderer = (entry, index) => {
    const makeTitle = () => {
      const defaultTitle =
        tExt(structure.name, {
          defaultValue: structure.name || structure.source,
        }) +
        ' #' +
        (index + 1);
      if (structure.collapsibleTitle) {
        try {
          const expression = jsonataWrapper(structure.collapsibleTitle);
          expression.assign('index', index);
          expression.assign('item', entry);
          expression.assign('root', originalResource);

          return expression.evaluate();
        } catch (e) {
          console.warn(e);
          return defaultTitle;
        }
      } else {
        return defaultTitle;
      }
    };

    const cells = (structure.children || []).map(column => {
      return (
        <Widget
          {...props}
          value={entry}
          arrayItem={entry}
          structure={column}
          schema={schema}
          originalResource={originalResource}
        />
      );
    });

    if (!structure.collapsible) {
      return cells;
    }

    return {
      cells,
      title: makeTitle(),
      collapseContent: (
        <td colspan="100%" className={tdClassNames}>
          {structure.collapsible.map(child => (
            <Widget
              {...props}
              value={entry}
              arrayItem={entry}
              structure={child}
              schema={schema}
              inlineRenderer={InlineWidget}
              originalResource={originalResource}
            />
          ))}
        </td>
      ),
    };
  };

  const sortOptions = (structure?.children || []).filter(child => child.sort);

  const className = `extensibility-table ${
    disableMargin ? 'fd-margin--xs' : ''
  }`;

  return (
    <GenericList
      showHeader={structure?.showHeader}
      className={className}
      title={tExt(structure.name, {
        defaultValue: structure.name || structure.source,
      })}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      {...handleTableValue(value, t)}
      sortBy={() => sortBy(sortOptions, tExt, {}, originalResource)}
      searchSettings={{
        showSearchSuggestion: false,
        showSearchField: structure?.showSearchField,
        allowSlashShortcut: false,
      }}
    />
  );
}
Table.array = true;
