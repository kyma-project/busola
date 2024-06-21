import { isEmpty } from 'lodash';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import { Table } from '@ui5/webcomponents-react';
import { useNavigate } from 'react-router-dom';
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
import './GenericList.scss';
import { UI5Panel } from '../UI5Panel/UI5Panel';
import { spacing } from '@ui5/webcomponents-react-base';
import { EmptyListComponent } from '../EmptyListComponent/EmptyListComponent';
import { useUrl } from 'hooks/useUrl';
import { columnLayoutState } from 'state/columnLayoutAtom';
import pluralize from 'pluralize';
import { isResourceEditedState } from 'state/resourceEditedAtom';
import { isFormOpenState } from 'state/formOpenAtom';
import { handleActionIfFormOpen } from '../UnsavedMessageBox/helpers';

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
  entries,
  actions,
  extraHeaderContent,
  title,
  headerRenderer,
  rowRenderer,
  testid,
  serverDataError,
  serverDataLoading,
  pagination,
  sortBy,
  notFoundMessage,
  searchSettings,
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
  handleRedirect = null,
  nameColIndex = 0,
  noHideFields,
  customRowClick,
}) => {
  const navigate = useNavigate();
  searchSettings = { ...defaultSearch, ...searchSettings };
  const [entrySelected, setEntrySelected] = useState('');
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
      return [...resources.sort(sortFunction)];
    } else {
      return [...resources.sort((a, b) => sortFunction(b, a))];
    }
  };

  const globalPageSize = useRecoilValue(pageSizeState);
  const [pageSize, setLocalPageSize] = useState(globalPageSize);
  useEffect(() => {
    setLocalPageSize(globalPageSize);
  }, [globalPageSize]);

  pagination = useMemo(() => {
    if (pagination) return { itemsPerPage: pageSize, ...(pagination || {}) };
    return undefined;
  }, [pageSize, pagination]);

  const { i18n, t } = useTranslation();
  const [currentPage, setCurrentPage] = React.useState(
    pagination?.initialPage || 1,
  );

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

  React.useEffect(() => setCurrentPage(1), [searchQuery]);

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
        <BodyFallback>
          <p>{getErrorMessage(serverDataError)}</p>
        </BodyFallback>
      );
    }

    if (serverDataLoading) {
      return (
        <BodyFallback>
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
      return (
        <BodyFallback>
          {emptyListProps ? (
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
              {i18n.exists(notFoundMessage)
                ? t(notFoundMessage)
                : notFoundMessage}
            </p>
          )}
        </BodyFallback>
      );
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
              entrySelected === e?.metadata?.name) ||
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
  const [isResourceEdited, setIsResourceEdited] = useRecoilState(
    isResourceEditedState,
  );
  const [isFormOpen, setIsFormOpen] = useRecoilState(isFormOpenState);
  const { resourceUrl: resourceUrlFn } = useUrl();
  const linkTo = entry => {
    return customUrl
      ? customUrl(entry)
      : resourceUrlFn(entry, { resourceType });
  };

  const handleRowClick = e => {
    if (customRowClick) {
      setEntrySelected(e.target.children[nameColIndex].innerText);
      return customRowClick(e.target.children[nameColIndex].innerText);
    } else {
      const selectedEntry = entries.find(entry => {
        return (
          entry?.metadata?.name === e.target.children[nameColIndex].innerText ||
          pluralize(entry?.spec?.names?.kind ?? '') ===
            e.target.children[nameColIndex].innerText ||
          entry?.name === e.target.children[nameColIndex].innerText
        );
      });

      if (handleRedirect) {
        const redirectLayout = handleRedirect(selectedEntry, resourceType);
        if (redirectLayout) {
          setLayoutColumn({
            ...redirectLayout,
          });
          navigate(
            redirectLayout.layout === 'OneColumn'
              ? linkTo(selectedEntry)
              : `${linkTo(selectedEntry)}?layout=${redirectLayout.layout}`,
          );
          return;
        }
      }
      setEntrySelected(
        selectedEntry?.metadata?.name ?? e.target.children[0].innerText,
      );
      if (!enableColumnLayout) {
        setLayoutColumn({
          midColumn: null,
          endColumn: null,
          layout: 'OneColumn',
        });

        navigate(linkTo(selectedEntry));
      } else {
        setLayoutColumn(
          columnLayout
            ? {
                midColumn: layoutState.midColumn,
                endColumn: customColumnLayout(selectedEntry),
                layout: columnLayout,
              }
            : {
                midColumn: {
                  resourceName:
                    selectedEntry?.metadata?.name ??
                    e.target.children[0].innerText,
                  resourceType: resourceType,
                  namespaceId: selectedEntry?.metadata?.namespace,
                },
                endColumn: null,
                layout: 'TwoColumnsMidExpanded',
              },
        );
        window.history.pushState(
          window.history.state,
          '',
          `${linkTo(selectedEntry)}?layout=${columnLayout ??
            'TwoColumnsMidExpanded'}`,
        );
      }
    }
  };

  return (
    <UI5Panel
      title={title}
      headerActions={!headerActionsEmpty && headerActions}
      data-testid={testid}
      disableMargin
      style={disableMargin ? {} : spacing.sapUiSmallMargin}
    >
      <Table
        className={`ui5-generic-list ${hasDetailsView ? 'cursor-pointer' : ''}`}
        onRowClick={e => {
          if (!hasDetailsView) return;
          handleActionIfFormOpen(
            isResourceEdited,
            setIsResourceEdited,
            isFormOpen,
            setIsFormOpen,
            () => handleRowClick(e),
          );
        }}
        columns={
          <HeaderRenderer
            entries={entries}
            actions={actions}
            headerRenderer={headerRenderer}
            disableHiding={disableHiding}
            displayArrow={displayArrow}
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
            setLocalPageSize={setLocalPageSize}
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

GenericList.defaultProps = {
  entries: [],
  actions: [],
  serverDataError: null,
  serverDataLoading: false,
  notFoundMessage: 'components.generic-list.messages.not-found',
  searchSettings: defaultSearch,
};
