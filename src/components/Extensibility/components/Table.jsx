import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isNil } from 'lodash';
import classNames from 'classnames';

import { GenericList } from 'shared/components/GenericList/GenericList';

import { getTextSearchProperties, useGetTranslation } from '../helpers';
import { useJsonata } from '../hooks/useJsonata';
import { sortBy } from '../helpers/sortBy';
import { InlineWidget, Widget } from './Widget';
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

const rowRenderer = (
  entry,
  index,
  structure,
  i18n,
  jsonata,
  arrayItems,
  title,
  setTitle,
  schema,
  originalResource,
  singleRootResource,
  props,
) => {
  const tdClassNames = classNames({
    'collapsible-panel': !structure.disablePadding,
  });
  const makeTitle = async () => {
    const defaultTitle = i18n.exists(structure.name)
      ? i18n.t(structure.name)
      : structure.name || structure.source + ' #' + (index + 1);
    if (structure.collapsibleTitle) {
      try {
        return await jsonata(structure.collapsibleTitle, {
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
  makeTitle().then((result) => {
    if (!structure.collapsible) {
      return;
    }
    if (result && JSON.stringify(title?.[index]) !== JSON.stringify(result)) {
      setTitle((prev) => ({ ...prev, [index]: result }));
    }
  });

  const cells = (structure.children || []).map((column, cellIndex) => {
    return (
      <Widget
        {...props}
        key={cellIndex}
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
    title: title?.[index] ?? '',
    collapseContent: (
      <div className={tdClassNames}>
        {structure.collapsible.map((child, cellIndex) => (
          <Widget
            {...props}
            key={cellIndex}
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
      </div>
    ),
  };
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
  const { i18n } = useGetTranslation();
  const jsonata = useJsonata({
    resource: originalResource,
    parent: singleRootResource,
    embedResource: embedResource,
    scope,
    value,
    arrayItems,
  });

  const [title, setTitle] = useState({});

  const coreHeaders = (structure.children || []).map(({ name }) =>
    i18n.t(name),
  );
  const headerRenderer = () =>
    structure.collapsible ? ['', ...coreHeaders] : coreHeaders;

  const { sortOptions } = getSortDetails(structure);

  const { searchOptions, defaultSearch } = getSearchDetails(structure);

  const extraHeaderContent = (structure.extraHeaderContent || []).map(
    (content, index) => {
      return (
        <Widget
          {...props}
          key={index}
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
      disableHiding={true}
      displayArrow={false}
      disableMargin={structure.disablePadding}
      className={'extensibility-table'}
      title={
        i18n.exists(structure.name)
          ? i18n.t(structure.name)
          : i18n.exists(structure.source)
            ? i18n.t(structure.source)
            : structure.name
      }
      extraHeaderContent={extraHeaderContent}
      headerRenderer={headerRenderer}
      rowRenderer={(entry, index) =>
        rowRenderer(
          entry,
          index,
          structure,
          i18n,
          jsonata,
          arrayItems,
          title,
          setTitle,
          schema,
          originalResource,
          singleRootResource,
          props,
        )
      }
      {...handleTableValue(value, t)}
      sortBy={() => sortBy(jsonata, sortOptions, i18n, {}, originalResource)}
      searchSettings={{
        showSearchField: searchOptions.length > 0,
        allowSlashShortcut: false,
        textSearchProperties: textSearchProperties(),
      }}
    />
  );
}

Table.array = true;
