import { useState } from 'react';
import { TFunction } from 'i18next';
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

const handleTableValue = (value: any, t: TFunction) => {
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
  entry: any,
  index: number,
  structure: any,
  tExt: any,
  jsonata: any,
  arrayItems: any[],
  title: any,
  setTitle: any,
  schema: any,
  originalResource: any,
  singleRootResource: any,
  props: any,
) => {
  const tdClassNames = classNames({
    'collapsible-panel': !structure.disablePadding,
  });
  const makeTitle = async () => {
    const defaultTitle =
      tExt(structure.name, {
        defaultValue: structure.name || structure.source,
      }) +
      ' #' +
      (index + 1);
    if (structure.collapsibleTitle) {
      try {
        return await jsonata(structure.collapsibleTitle, {
          index: index,
          scope: entry,
          arrayItems: [...arrayItems, entry],
        });
      } catch (e) {
        console.warn('Failed to evaluate collapsible title:', e);
        return defaultTitle;
      }
    } else {
      return defaultTitle;
    }
  };
  makeTitle().then((result: any) => {
    if (!structure.collapsible) {
      return;
    }
    if (result && JSON.stringify(title?.[index]) !== JSON.stringify(result)) {
      setTitle((prev: any) => ({ ...prev, [index]: result }));
    }
  });

  const cells = (structure.children || []).map(
    (column: any, cellIndex: number) => {
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
    },
  );

  if (!structure.collapsible) {
    return cells;
  }

  return {
    cells,
    title: title?.[index] ?? '',
    collapseContent: (
      <div className={tdClassNames}>
        {structure.collapsible.map((child: any, cellIndex: number) => (
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

interface TableProps {
  value: any;
  structure: any;
  schema: any;
  originalResource: any;
  scope: any;
  arrayItems?: any[];
  singleRootResource: any;
  embedResource: any;
  [key: string]: any;
}

export function Table({
  value,
  structure,
  schema,
  originalResource,
  scope: _scope,
  arrayItems = [],
  singleRootResource,
  embedResource,
  ...props
}: TableProps) {
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
    scope: value,
    arrayItems,
  });

  const [title, setTitle] = useState({});

  const coreHeaders = (structure.children || []).map(
    ({ name }: { name: string }) => tExt(name),
  );
  const headerRenderer = () =>
    structure.collapsible ? ['', ...coreHeaders] : coreHeaders;

  const { sortOptions } = getSortDetails(structure);

  const { searchOptions, defaultSearch } = getSearchDetails(structure);

  const extraHeaderContent = (structure.extraHeaderContent || []).map(
    (content: any, index: number) => {
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
      className="extensibility-table"
      title={tExt(structure.name, {
        defaultValue: structure.name || structure.source,
      })}
      extraHeaderContent={extraHeaderContent}
      headerRenderer={headerRenderer}
      rowRenderer={(entry: any, index: number) =>
        rowRenderer(
          entry,
          index,
          structure,
          tExt,
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
      sortBy={() => sortBy(jsonata, sortOptions, tExt, {})}
      searchSettings={{
        showSearchField: searchOptions.length > 0,
        allowSlashShortcut: false,
        textSearchProperties: textSearchProperties(),
      }}
    />
  );
}
Table.array = true;
