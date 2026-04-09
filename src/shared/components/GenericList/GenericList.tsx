import { isEmpty } from 'lodash';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAtom, useAtomValue } from 'jotai';

import { useNavigate, useSearchParams } from 'react-router';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';
import { HeaderRenderer } from './components/HeaderRenderer';
import {
  FilteredEntriesType,
  PaginationType,
  SearchSettingsType,
  TableBody,
} from './components/TableBody';
import { filterEntries } from 'shared/components/GenericList/helpers';
import { Pagination } from 'shared/components/GenericList/Pagination/Pagination';
import { SearchInput } from 'shared/components/GenericList/SearchInput';
import ListActions from 'shared/components/ListActions/ListActions';
import { Sort, SortModalPanel } from './SortModalPanel';
import { nameLocaleSort, timeSort } from 'shared/helpers/sortingfunctions';
import { pageSizeAtom } from 'state/settings/pageSizeAtom';
import { UI5Panel } from '../UI5Panel/UI5Panel';
import { EmptyListComponent } from '../EmptyListComponent/EmptyListComponent';
import { useUrl } from 'hooks/useUrl';
import { columnLayoutAtom } from 'state/columnLayoutAtom';
import pluralize from 'pluralize';
import { extractApiGroupVersion } from 'resources/Roles/helpers';
import { Table, TableDomRef, Ui5CustomEvent } from '@ui5/webcomponents-react';
import './GenericList.scss';
import { asyncSort } from 'components/Extensibility/helpers/sortBy';
import { useDebounce } from 'hooks/useDebounce';
import { K8sResource } from 'types';
import { TableRowClickEventDetail } from '@ui5/webcomponents/dist/Table';
import FCLLayout from '@ui5/webcomponents-fiori/dist/types/FCLLayout';

type AsyncSortFunction = {
  asyncFn: (a: any, b: any) => Promise<any>;
};

type SortFunction = (a: any, b: any) => number;

export type SortByObject = Record<string, SortFunction | AsyncSortFunction>;

export type Actions = {
  name: string;
  handler: (resource: any) => void;
  tooltip?: string | ((entry: any) => string);
  icon?: string | (() => string);
  disabledHandler?: (entry: any) => boolean;
  [key: string]: any;
}[];

export type EmptyListProps = {
  simpleEmptyListMessage?: boolean;
  titleText?: string;
  subtitleText?: string;
  showButton?: boolean;
  buttonText?: string;
  url?: string;
  onClick?: () => void;
  image?: 'TntComponents' | 'NoEntries';
};

type GenericListProps = {
  title?: string;
  entries?: FilteredEntriesType[];
  headerRenderer: () => (string | ReactNode)[];
  columnWidths?: (string | undefined)[];
  rowRenderer: (entry: any, actions?: any) => ReactNode[];
  actions?: Actions;
  extraHeaderContent?: ReactNode;
  testid?: string;
  serverDataError?: any;
  serverDataLoading?: boolean;
  pagination?: PaginationType;
  sortBy?: SortByObject | ((a: any) => SortByObject);
  notFoundMessage?: string;
  searchSettings?: SearchSettingsType;
  emptyListProps?: EmptyListProps;
  columnLayout?: FCLLayout;
  customColumnLayout?: (entry: any) => any;
  enableColumnLayout?: boolean;
  resourceType?: string;
  rawResourceType?: string;
  customUrl?: (entry: any) => string;
  hasDetailsView?: boolean;
  disableHiding?: boolean;
  displayArrow?: boolean;
  nameColIndex?: number;
  namespaceColIndex?: number;
  noHideFields?: string[];
  customRowClick?: (name: string, entry: any) => void;
  className?: string;
  accessibleName?: string;
  customSelectedEntry?: string;
};

const defaultSort = {
  name: nameLocaleSort,
  time: timeSort,
};

const defaultSearch = {
  showSearchField: true,
  textSearchProperties: ['name', 'description'],
  showSearchSuggestion: true,
  allowSlashShortcut: true,
  noSearchResultTitle:
    'components.generic-list.messages.no-search-results-title',
  noSearchResultSubtitle:
    'components.generic-list.messages.no-search-results-subtitle',
};

export const GenericList = ({
  entries = [],
  actions = [],
  extraHeaderContent,
  title,
  headerRenderer,
  columnWidths,
  rowRenderer,
  testid,
  serverDataError,
  serverDataLoading = false,
  pagination,
  sortBy,
  notFoundMessage = 'components.generic-list.messages.not-found',
  searchSettings = defaultSearch,
  emptyListProps,
  columnLayout,
  customColumnLayout,
  enableColumnLayout,
  resourceType = '',
  rawResourceType = '',
  customUrl,
  hasDetailsView,
  disableHiding = true,
  displayArrow = false,
  nameColIndex = 0,
  namespaceColIndex = -1,
  noHideFields,
  customRowClick,
  className = '',
  accessibleName,
  customSelectedEntry = '',
}: GenericListProps) => {
  const navigate = useNavigate();
  searchSettings = { ...defaultSearch, ...searchSettings };
  const [entrySelected, setEntrySelected] = useState<string | string[]>(
    customSelectedEntry,
  );
  const [entrySelectedNamespace, setEntrySelectedNamespace] = useState('');
  if (typeof sortBy === 'function') sortBy = sortBy(defaultSort);

  const [sort, setSort] = useState<Sort>({
    name: sortBy && Object.keys(sortBy)[0],
    order: 'ASC',
  });

  useEffect(() => {
    setEntrySelected(customSelectedEntry || '');
  }, [customSelectedEntry]);

  const sorting = async (sort: Sort, resources: any[]) => {
    if (!sortBy || isEmpty(sortBy)) return resources;

    const sortFunction = Object.entries(sortBy).filter(([name]) => {
      return name === sort.name;
    })[0][1];

    if ((sortFunction as AsyncSortFunction)?.asyncFn) {
      if (sort.order === 'ASC') {
        return await asyncSort(
          [...resources],
          (sortFunction as AsyncSortFunction).asyncFn,
        );
      } else {
        return await asyncSort(
          [...resources],
          (sortFunction as AsyncSortFunction).asyncFn,
          true,
        );
      }
    }

    if (sort.order === 'ASC') {
      return [...resources].sort(sortFunction as SortFunction);
    } else {
      return [...resources].sort((a, b) =>
        (sortFunction as SortFunction)(b, a),
      );
    }
  };

  const globalPageSize = useAtomValue(pageSizeAtom);
  const [pageSize, setPageSize] = useState(globalPageSize);

  useEffect(() => {
    setPageSize(globalPageSize);
  }, [globalPageSize]);

  pagination = useMemo(() => {
    if (pagination) return { itemsPerPage: pageSize, ...(pagination || {}) };
    return undefined;
  }, [pageSize, pagination]);

  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(pagination?.initialPage || 1);
  const [layoutState, setLayoutColumn] = useAtom(columnLayoutAtom);
  const [filteredEntries, setFilteredEntries] = useState<any[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get('search');
  const setSearchFieldFromURL =
    layoutState?.startColumn?.resourceType === resourceType;
  const [searchQuery, setSearchQuery] = useState(
    setSearchFieldFromURL && searchParam ? searchParam : '',
  );
  const debouncedSearch = useDebounce(searchQuery, 3000);

  useEffect(() => {
    if (setSearchFieldFromURL && debouncedSearch) {
      searchParams.set('search', debouncedSearch);
      setSearchParams(searchParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  useEffect(() => {
    if (pagination?.itemsPerPage) {
      // move back when the last item from the last page is deleted
      const pagesCount = Math.ceil(entries.length / pagination.itemsPerPage);
      if (currentPage > pagesCount && pagesCount > 0) {
        setCurrentPage(pagesCount);
      }
    }

    const getFilteredEntries = async () => {
      const sorted = await sorting(sort, entries);
      const filtered = await filterEntries(
        sorted,
        searchQuery,
        searchSettings?.textSearchProperties,
      );
      setFilteredEntries(filtered);
    };
    getFilteredEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    searchQuery,
    setFilteredEntries,
    entries,
    pagination?.itemsPerPage,
    sort,
  ]);

  useEffect(() => setCurrentPage(1), [searchQuery]);

  useEffect(() => {
    const selected = entries
      .filter((entry) => {
        const name = entry?.metadata?.name;
        return (
          name &&
          window.location.href.includes(name) &&
          window.location.href.includes(resourceType.toLowerCase())
        );
      })
      ?.map((entry) => entry?.metadata?.name);
    if (selected?.length) {
      // There is often more than one match due to similar names (e.g. `test`, `test123`),
      // so entrySelected can be a string or an array of strings.
      // This (the correct one) is resolved in TableBody.
      setEntrySelected(
        (selected?.length === 1 ? selected[0] : selected) as string | string[],
      );
      const namespaceParam = searchParams.get('resourceNamespace');
      if (namespaceParam) setEntrySelectedNamespace(namespaceParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries, resourceType]);

  const headerActions = (
    <>
      {searchSettings?.showSearchField && (
        <SearchInput
          entriesKind={title || resourceType || ''}
          searchQuery={searchQuery}
          filteredEntries={filteredEntries}
          handleQueryChange={setSearchQuery}
          suggestionProperties={searchSettings?.textSearchProperties}
          showSuggestion={searchSettings?.showSearchSuggestion}
          allowSlashShortcut={searchSettings?.allowSlashShortcut}
          disabled={!entries.length}
        />
      )}
      {extraHeaderContent}
      {sortBy && !isEmpty(sortBy) && (
        <SortModalPanel
          sortBy={sortBy}
          sort={sort}
          setSort={setSort}
          disabled={!entries.length}
          defaultSort={{
            name: sortBy && Object.keys(sortBy)[0],
            order: 'ASC',
          }}
        />
      )}
    </>
  );

  const headerActionsEmpty =
    !searchSettings?.showSearchField &&
    !(sortBy && !isEmpty(sortBy)) &&
    !(extraHeaderContent && !isEmpty(extraHeaderContent));

  const { navigateSafely } = useFormNavigation();
  const { resourceUrl: resourceUrlFn, namespace } = useUrl();
  const linkTo = (entry: K8sResource) => {
    const overrides = namespace === '-all-' ? { namespace } : {};
    return customUrl
      ? customUrl(entry)
      : resourceUrlFn(entry, { resourceType, ...overrides });
  };

  const handleRowClick = (
    e: Ui5CustomEvent<TableDomRef, TableRowClickEventDetail>,
  ) => {
    const arrowColumnCount = displayArrow ? 1 : 0;
    const nameColElement =
      e?.detail?.row?.children?.[nameColIndex + arrowColumnCount];
    const item = (
      (nameColElement?.children?.[0] as HTMLElement)?.innerText ??
      (nameColElement as HTMLElement)?.innerText
    )?.trimEnd();

    const hasNamepace = namespaceColIndex !== -1;
    const namespaceColElement = hasNamepace
      ? e?.detail?.row?.children?.[namespaceColIndex + arrowColumnCount]
      : null;
    const itemNamespace = hasNamepace
      ? ((namespaceColElement?.children?.[0] as HTMLElement)?.innerText ??
        (namespaceColElement as HTMLElement)?.innerText)
      : '';

    const selectedEntry = entries.find((entry) => {
      return (
        (entry?.metadata?.name === item ||
          pluralize(entry?.spec?.names?.kind ?? '') === item ||
          entry?.name === item) &&
        (!hasNamepace ||
          entry?.metadata?.namespace === itemNamespace ||
          // special case for Community Modules
          entry?.resource?.metadata?.namespace === itemNamespace)
      );
    });

    if (customRowClick) {
      setEntrySelected(item);
      setEntrySelectedNamespace(itemNamespace);
      return customRowClick(item, selectedEntry);
    } else {
      setEntrySelected(
        selectedEntry?.metadata?.name ??
          (e.target.children[0] as HTMLElement).innerText,
      );
      setEntrySelectedNamespace(
        selectedEntry?.metadata?.namespace ?? selectedEntry?.namespace ?? '',
      );

      const { group, version } = extractApiGroupVersion(
        selectedEntry?.apiVersion,
      );
      const newLayout: FCLLayout = enableColumnLayout
        ? (columnLayout ?? FCLLayout.TwoColumnsMidExpanded)
        : FCLLayout.OneColumn;
      setLayoutColumn(
        columnLayout
          ? {
              ...layoutState,
              showCreate: null,
              endColumn: customColumnLayout?.(selectedEntry),
              layout: newLayout,
              showEdit: null,
            }
          : {
              ...layoutState,
              showCreate: null,
              midColumn: {
                resourceName:
                  selectedEntry?.metadata?.name ??
                  (e.target.children[0] as HTMLElement).innerText,
                resourceType: resourceType,
                rawResourceTypeName: rawResourceType,
                namespaceId: selectedEntry?.metadata?.namespace,
                apiGroup: group,
                apiVersion: version,
              },
              endColumn: null,
              layout: newLayout,
              showEdit: null,
            },
      );
      const link = `${linkTo(selectedEntry as any)}${
        enableColumnLayout
          ? `?${searchQuery === '' ? '' : `search=${searchParam}&`}layout=${columnLayout ?? 'TwoColumnsMidExpanded'}${
              namespace === '-all-' && selectedEntry?.metadata?.namespace
                ? `&resourceNamespace=${selectedEntry?.metadata?.namespace}`
                : ''
            }`
          : ''
      }`;
      navigate(link);
    }
  };

  const setOverflowMode = () => {
    const anyPopinHidden = headerRenderer().some((h) => h === 'Popin');
    if (!anyPopinHidden && !noHideFields && disableHiding) {
      return 'Scroll';
    }
    return 'Popin';
  };

  return (
    <UI5Panel
      title={title}
      headerActions={!headerActionsEmpty && headerActions}
      testid={testid}
      className={className}
      accessibleName={`${title} panel`}
    >
      <Table
        noData={
          <div>
            {!serverDataError &&
              !serverDataLoading &&
              !entries?.length &&
              !searchQuery &&
              !filteredEntries?.length &&
              (emptyListProps?.simpleEmptyListMessage === false ||
              (emptyListProps && !emptyListProps.simpleEmptyListMessage) ? (
                <EmptyListComponent
                  titleText={emptyListProps.titleText ?? ''}
                  subtitleText={emptyListProps.subtitleText}
                  showButton={emptyListProps.showButton}
                  buttonText={emptyListProps.buttonText}
                  url={emptyListProps.url ?? ''}
                  onClick={emptyListProps.onClick ?? (() => null)}
                  image={emptyListProps?.image}
                />
              ) : (
                <p>
                  {emptyListProps?.titleText ? (
                    <Trans
                      i18nKey={emptyListProps?.titleText}
                      defaults={emptyListProps?.titleText}
                    />
                  ) : (
                    t(notFoundMessage, { defaultValue: notFoundMessage })
                  )}
                </p>
              ))}
          </div>
        }
        overflowMode={setOverflowMode()}
        accessibleName={accessibleName ?? title}
        rowActionCount={displayArrow ? 1 : 0}
        className={`ui5-generic-list ${
          hasDetailsView && filteredEntries.length && enableColumnLayout
            ? 'cursor-pointer'
            : ''
        }`}
        onMouseDown={() => {
          window.getSelection()?.removeAllRanges();
        }}
        onRowClick={(e) => {
          const selection = window.getSelection()?.toString();
          if (!hasDetailsView || (selection?.length && selection?.length > 0))
            return;
          navigateSafely(() => handleRowClick(e));
        }}
        headerRow={
          <HeaderRenderer
            actions={actions}
            headerRenderer={headerRenderer}
            columnWidths={columnWidths}
            disableHiding={disableHiding}
            noHideFields={noHideFields ?? []}
          />
        }
      >
        <TableBody
          serverDataError={serverDataError}
          serverDataLoading={serverDataLoading}
          filteredEntries={filteredEntries}
          searchQuery={searchQuery}
          searchSettings={searchSettings}
          entries={entries}
          pagination={pagination}
          currentPage={currentPage}
          layoutState={layoutState}
          entrySelected={entrySelected}
          entrySelectedNamespace={entrySelectedNamespace}
          actions={actions}
          rowRenderer={rowRenderer}
          displayArrow={displayArrow}
          enableColumnLayout={!!enableColumnLayout}
        />
      </Table>
      {pagination &&
        (!pagination.autoHide ||
          filteredEntries.length > (pagination?.itemsPerPage ?? 0)) && (
          <Pagination
            itemsTotal={filteredEntries.length}
            currentPage={currentPage}
            itemsPerPage={pagination.itemsPerPage ?? 0}
            onChangePage={setCurrentPage}
            setLocalPageSize={setPageSize}
          />
        )}
    </UI5Panel>
  );
};

GenericList.Actions = ListActions;
