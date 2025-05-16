import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import { useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useNavigate } from 'react-router';
import { useFormNavigation } from 'shared/hooks/useFormNavigation';
import {
  BodyFallback,
  HeaderRenderer,
  RowRenderer,
} from 'shared/components/GenericList/components';
import { filterEntries } from 'shared/components/GenericList/helpers';
import { Pagination } from 'shared/components/GenericList/Pagination/Pagination';
import { SearchInput } from 'shared/components/GenericList/SearchInput';
import ListActions from 'shared/components/ListActions/ListActions';
import { Spinner } from 'shared/components/Spinner/Spinner';
import CustomPropTypes from 'shared/typechecking/CustomPropTypes';
import { SortModalPanel } from './SortModalPanel';
import { nameLocaleSort, timeSort } from 'shared/helpers/sortingfunctions';
import { getErrorMessage } from 'shared/utils/helpers';
import { pageSizeState } from 'state/preferences/pageSizeAtom';
import { UI5Panel } from '../UI5Panel/UI5Panel';
import { EmptyListComponent } from '../EmptyListComponent/EmptyListComponent';
import { useUrl } from 'hooks/useUrl';
import { columnLayoutState } from 'state/columnLayoutAtom';
import pluralize from 'pluralize';
import { extractApiGroupVersion } from 'resources/Roles/helpers';
import { Table } from '@ui5/webcomponents-react';
import './GenericList.scss';

const defaultSort = {
  name: nameLocaleSort,
  time: timeSort,
};

const defaultSearch = {
  showSearchField: true,
  textSearchProperties: ['name', 'description'],
  showSearchSuggestion: true,
  allowSlashShortcut: true,
  noSearchResultMessage: 'components.generic-list.messages.no-search-results',
};

export const GenericList = ({
  entries = [],
  actions = [],
  extraHeaderContent,
  title,
  headerRenderer,
  rowRenderer,
  testid,
  serverDataError = null,
  serverDataLoading = false,
  pagination,
  sortBy,
  notFoundMessage = 'components.generic-list.messages.not-found',
  searchSettings = defaultSearch,
  disableMargin,
  emptyListProps = null,
  columnLayout = null,
  customColumnLayout = null,
  enableColumnLayout,
  resourceType = '',
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
}) => {
  const navigate = useNavigate();
  searchSettings = { ...defaultSearch, ...searchSettings };
  const [entrySelected, setEntrySelected] = useState('');
  const [entrySelectedNamespace, setEntrySelectedNamespace] = useState('');
  if (typeof sortBy === 'function') sortBy = sortBy(defaultSort);

  const [sort, setSort] = useState({
    name: sortBy && Object.keys(sortBy)[0],
    order: 'ASC',
  });

  const sorting = (sort, resources) => {
    if (!sortBy || isEmpty(sortBy)) return resources;

    const sortFunction = Object.entries(sortBy).filter(([name]) => {
      return name === sort.name;
    })[0][1];

    if (sort.order === 'ASC') {
      return [...resources].sort(sortFunction);
    } else {
      return [...resources].sort((a, b) => sortFunction(b, a));
    }
  };

  const globalPageSize = useRecoilValue(pageSizeState);
  const [pageSize, setPageSize] = useState(globalPageSize);

  useEffect(() => {
    setPageSize(globalPageSize);
  }, [globalPageSize]);

  pagination = useMemo(() => {
    if (pagination) return { itemsPerPage: pageSize, ...(pagination || {}) };
    return undefined;
  }, [pageSize, pagination]);

  const { i18n, t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(pagination?.initialPage || 1);

  const [filteredEntries, setFilteredEntries] = useState(() =>
    sorting(sort, entries),
  );
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (pagination) {
      // move back when the last item from the last page is deleted
      const pagesCount = Math.ceil(entries.length / pagination.itemsPerPage);
      if (currentPage > pagesCount && pagesCount > 0) {
        setCurrentPage(pagesCount);
      }
    }

    setFilteredEntries(
      filterEntries(
        sorting(sort, entries),
        searchQuery,
        searchSettings?.textSearchProperties,
      ),
    );
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
    const selected = entries.find(entry => {
      const name = entry?.metadata?.name;
      return name && window.location.href.includes(name);
    })?.metadata?.name;

    if (selected) {
      setEntrySelected(selected);
    }
  }, [entries]);

  const headerActions = (
    <>
      {searchSettings?.showSearchField && (
        <SearchInput
          entriesKind={title || ''}
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

  const renderTableBody = () => {
    if (serverDataError) {
      return (
        <BodyFallback key="tableErrorMessage">
          <p>{getErrorMessage(serverDataError)}</p>
        </BodyFallback>
      );
    }

    if (serverDataLoading) {
      return (
        <BodyFallback key="tableDataLoading">
          <Spinner />
        </BodyFallback>
      );
    }
    if (!filteredEntries.length) {
      if (searchQuery) {
        return (
          <BodyFallback>
            <p>
              {i18n.exists(searchSettings.noSearchResultMessage)
                ? t(searchSettings.noSearchResultMessage)
                : searchSettings.noSearchResultMessage}
            </p>
          </BodyFallback>
        );
      }

      if (!entries.length) {
        return (
          <BodyFallback>
            {emptyListProps?.simpleEmptyListMessage === false ||
            (emptyListProps && !emptyListProps.simpleEmptyListMessage) ? (
              <EmptyListComponent
                titleText={emptyListProps.titleText}
                subtitleText={emptyListProps.subtitleText}
                showButton={emptyListProps.showButton}
                buttonText={emptyListProps.buttonText}
                url={emptyListProps.url}
                onClick={emptyListProps.onClick}
                image={emptyListProps?.image}
              />
            ) : (
              <p>
                {emptyListProps?.titleText ? (
                  <Trans i18nKey={emptyListProps?.titleText} />
                ) : i18n.exists(notFoundMessage) ? (
                  t(notFoundMessage)
                ) : (
                  notFoundMessage
                )}
              </p>
            )}
          </BodyFallback>
        );
      }
    }

    let pagedItems = filteredEntries;
    if (pagination) {
      pagedItems = filteredEntries.slice(
        (currentPage - 1) * pagination.itemsPerPage,
        currentPage * pagination.itemsPerPage,
      );
    }

    return pagedItems.map((e, index) => {
      // Special case for Kyma modules
      let isModuleSelected;
      if (
        window.location.href.includes('kymamodules') &&
        layoutState?.midColumn
      ) {
        // Workaround for modules like btp-operator on refresh
        const resourceType = layoutState.midColumn.resourceType;
        const resourceTypeDotIndex = resourceType.indexOf('.');
        const resourceTypeBase =
          resourceTypeDotIndex !== -1
            ? resourceType.substring(0, resourceTypeDotIndex)
            : resourceType;

        // Check if the entry is selected using click or refresh
        isModuleSelected = entrySelected
          ? entrySelected === e?.name
          : pluralize(e?.name?.replace('-', '') || '') === resourceTypeBase;
      }

      return (
        <RowRenderer
          isSelected={
            ((layoutState?.midColumn?.resourceName === e.metadata?.name ||
              layoutState?.endColumn?.resourceName === e.metadata?.name) &&
              entrySelected === e?.metadata?.name &&
              (entrySelectedNamespace === '' ||
                entrySelectedNamespace === e?.metadata?.namespace)) ||
            isModuleSelected
          }
          index={index}
          key={e.metadata?.uid || e.name || e.metadata?.name || index}
          entry={e}
          actions={actions}
          rowRenderer={rowRenderer}
          displayArrow={displayArrow}
          hasDetailsView={hasDetailsView}
        />
      );
    });
  };

  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const { navigateSafely } = useFormNavigation();
  const { resourceUrl: resourceUrlFn, namespace } = useUrl();
  const linkTo = entry => {
    const overrides = namespace === '-all-' ? { namespace } : {};
    return customUrl
      ? customUrl(entry)
      : resourceUrlFn(entry, { resourceType, ...overrides });
  };

  const handleRowClick = e => {
    const arrowColumnCount = displayArrow ? 1 : 0;
    const item = (
      e.detail.row.children[nameColIndex + arrowColumnCount].children[0]
        .innerText ??
      e.detail.row.children[nameColIndex + arrowColumnCount].innerText
    )?.trimEnd();

    const hasNamepace = namespaceColIndex !== -1;
    const itemNamespace = hasNamepace
      ? e?.detail?.row.children[namespaceColIndex + arrowColumnCount]
          ?.children[0]?.innerText ??
        e?.detail?.row.children[namespaceColIndex + arrowColumnCount]?.innerText
      : '';

    const selectedEntry = entries.find(entry => {
      return (
        (entry?.metadata?.name === item ||
          pluralize(entry?.spec?.names?.kind ?? '') === item ||
          entry?.name === item) &&
        (!hasNamepace || entry?.metadata?.namespace === itemNamespace)
      );
    });

    if (customRowClick) {
      setEntrySelected(item);
      setEntrySelectedNamespace(itemNamespace);
      return customRowClick(item, selectedEntry);
    } else {
      setEntrySelected(
        selectedEntry?.metadata?.name ?? e.target.children[0].innerText,
      );
      setEntrySelectedNamespace(selectedEntry?.metadata?.namespace ?? '');

      const { group, version } = extractApiGroupVersion(
        selectedEntry?.apiVersion,
      );
      const newLayout = enableColumnLayout
        ? columnLayout ?? 'TwoColumnsMidExpanded'
        : 'OneColumn';
      setLayoutColumn(
        columnLayout
          ? {
              ...layoutState,
              showCreate: null,
              endColumn: customColumnLayout(selectedEntry),
              layout: newLayout,
              showEdit: null,
            }
          : {
              ...layoutState,
              showCreate: null,
              midColumn: {
                resourceName:
                  selectedEntry?.metadata?.name ??
                  e.target.children[0].innerText,
                resourceType: resourceType,
                namespaceId: selectedEntry?.metadata?.namespace,
                apiGroup: group,
                apiVersion: version,
              },
              endColumn: null,
              layout: newLayout,
              showEdit: null,
            },
      );
      const link = `${linkTo(selectedEntry)}${
        enableColumnLayout
          ? `?layout=${columnLayout ?? 'TwoColumnsMidExpanded'}`
          : ''
      }`;
      navigate(link);
    }
  };

  const setOverflowMode = () => {
    const anyPopinHidden = headerRenderer().some(h => h === 'Popin');
    if (!anyPopinHidden && !noHideFields && disableHiding) {
      return 'Scroll';
    }
    return 'Popin';
  };

  return (
    <UI5Panel
      title={title}
      headerActions={!headerActionsEmpty && headerActions}
      data-testid={testid}
      disableMargin={disableMargin}
      className={className}
    >
      <Table
        overflowMode={setOverflowMode()}
        accessibleName={accessibleName ?? title}
        rowActionCount={displayArrow ? 1 : 0}
        className={`ui5-generic-list ${
          hasDetailsView && filteredEntries.length ? 'cursor-pointer' : ''
        }`}
        onMouseDown={() => {
          window.getSelection().removeAllRanges();
        }}
        onRowClick={e => {
          const selection = window.getSelection().toString();
          if (!hasDetailsView || selection.length > 0) return;
          navigateSafely(() => handleRowClick(e));
        }}
        headerRow={
          <HeaderRenderer
            entries={entries}
            actions={actions}
            headerRenderer={headerRenderer}
            disableHiding={disableHiding}
            noHideFields={noHideFields}
          />
        }
      >
        {renderTableBody()}
      </Table>
      {pagination &&
        (!pagination.autoHide ||
          filteredEntries.length > pagination.itemsPerPage) && (
          <Pagination
            itemsTotal={filteredEntries.length}
            currentPage={currentPage}
            itemsPerPage={pagination.itemsPerPage}
            onChangePage={setCurrentPage}
            setLocalPageSize={setPageSize}
          />
        )}
    </UI5Panel>
  );
};

GenericList.Actions = ListActions;

const PaginationProps = PropTypes.shape({
  itemsPerPage: PropTypes.number,
  initialPage: PropTypes.number,
  autoHide: PropTypes.bool,
});

const SearchProps = PropTypes.shape({
  showSearchField: PropTypes.bool,
  textSearchProperties: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.func.isRequired,
    ]),
  ),
  showSearchSuggestion: PropTypes.bool,
  allowSlashShortcut: PropTypes.bool,
  noSearchResultMessage: PropTypes.string,
});

GenericList.propTypes = {
  title: PropTypes.string,
  entries: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  ).isRequired,
  headerRenderer: PropTypes.func.isRequired,
  rowRenderer: PropTypes.func.isRequired,
  actions: CustomPropTypes.listActions,
  extraHeaderContent: PropTypes.node,
  testid: PropTypes.string,
  serverDataError: PropTypes.any,
  serverDataLoading: PropTypes.bool,
  pagination: PaginationProps,
  sortBy: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  notFoundMessage: PropTypes.string,
  searchSettings: SearchProps,
  disableMargin: PropTypes.bool,
  enableColumnLayout: PropTypes.bool,
  customUrl: PropTypes.func,
  hasDetailsView: PropTypes.bool,
  noHideFields: PropTypes.arrayOf(PropTypes.string),
  customRowClick: PropTypes.func,
};
