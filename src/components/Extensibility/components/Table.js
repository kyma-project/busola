import React from 'react';
import { useTranslation } from 'react-i18next';
import { isNil } from 'lodash';
import classNames from 'classnames';

import { GenericList } from 'shared/components/GenericList/GenericList';

import { useGetTranslation, getTextSearchProperties } from '../helpers';
import { useJsonata } from '../hooks/useJsonata';
import { sortBy } from '../helpers/sortBy';
import { Widget, InlineWidget } from './Widget';
import { getSearchDetails, getSortDetails } from './helpers';

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

export function Table({
  value,
  structure,
  schema,
  originalResource,
  scope,
  arrayItems = [],
  singleRootResource,
  embedResource,
  ...props
}) {
  // cleanup jsonata results
  if (!Array.isArray(value)) {
    if (isNil(value)) {
      value = [];
    } else {
      value = [value];
    }
  }

  const { t } = useTranslation();
  const { t: tExt } = useGetTranslation();
  const jsonata = useJsonata({
    resource: originalResource,
    parent: singleRootResource,
    embedResource: embedResource,
    scope,
    value,
    arrayItems,
  });

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
          return jsonata(structure.collapsibleTitle, {
            index: index,
            scope: entry,
            arrayItems: [...arrayItems, entry],
          });
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
          scope={entry}
          arrayItems={[...arrayItems, entry]}
          structure={column}
          schema={schema}
          originalResource={originalResource}
          singleRootResource={singleRootResource}
          index={index}
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
        // TODO replace once new Table component is available in ui5-webcomponents-react
        <td colSpan="100%" className={tdClassNames}>
          {structure.collapsible.map(child => (
            <Widget
              {...props}
              value={entry}
              scope={entry}
              arrayItems={[...arrayItems, entry]}
              structure={child}
              schema={schema}
              inlineRenderer={InlineWidget}
              originalResource={originalResource}
              singleRootResource={singleRootResource}
              index={index}
            />
          ))}
        </td>
      ),
    };
  };

  const { sortOptions } = getSortDetails(structure);

  const { searchOptions, defaultSearch } = getSearchDetails(structure);

  const extraHeaderContent = (structure.extraHeaderContent || []).map(
    content => {
      return (
        <Widget
          {...props}
          {...props}
          value={value}
          structure={content}
          schema={schema}
          originalResource={originalResource}
          singleRootResource={singleRootResource}
        />
      );
    },
  );

  const textSearchProperties = getTextSearchProperties({
    searchOptions,
    defaultSearch,
  });

  return (
    <GenericList
      disableMargin={structure.disablePadding}
      className={'extensibility-table'}
      title={tExt(structure.name, {
        defaultValue: structure.name || structure.source,
      })}
      extraHeaderContent={extraHeaderContent}
      headerRenderer={headerRenderer}
      rowRenderer={rowRenderer}
      {...handleTableValue(value, t)}
      sortBy={() => sortBy(jsonata, sortOptions, tExt, {}, originalResource)}
      searchSettings={{
        showSearchField: searchOptions.length > 0,
        allowSlashShortcut: false,
        textSearchProperties: textSearchProperties(),
      }}
    />
  );
}
Table.array = true;
