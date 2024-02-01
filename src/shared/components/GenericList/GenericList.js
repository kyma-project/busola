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

const defaultSort = {
  name: nameLocaleSort,
  time: timeSort,
};

const defaultSearch = {
  showSearchField: true,
  textSearchProperties: ['name', 'description'],
  showSearchControl: true,
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
  currentlyEditedResourceUID,
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

  const pageSize = useRecoilValue(pageSizeState);
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
          showSearchControl={searchSettings?.showSearchControl}
          allowSlashShortcut={searchSettings?.allowSlashShortcut}
          disabled={!entries.length}
        />
      )}
      {sortBy && !isEmpty(sortBy) && (
        <SortModalPanel
          sortBy={sortBy}
          sort={sort}
          setSort={setSort}
          disabled={!entries.length}
        />
      )}
      {extraHeaderContent}
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

    return pagedItems.map((e, index) => (
      <RowRenderer
        isSelected={entrySelected === e.metadata?.name}
        index={index}
        key={e.metadata?.uid || e.name || e.metadata?.name || index}
        entry={e}
        actions={actions}
        rowRenderer={rowRenderer}
        isBeingEdited={
          currentlyEditedResourceUID &&
          e?.metadata?.uid === currentlyEditedResourceUID
        }
      />
    ));
  };
  const [layoutState, setLayoutColumn] = useRecoilState(columnLayoutState);
  const { resourceUrl: resourceUrlFn } = useUrl();
  const linkTo = entry => {
    return customUrl
      ? customUrl(entry)
      : resourceUrlFn(entry, { resourceType });
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
        className={'ui5-generic-list'}
        onRowClick={e => {
          if (!hasDetailsView) return;
          const selectedEntry = entries.find(entry => {
            return (
              entry.metadata.name === e.target.children[0].innerText ||
              pluralize(entry?.spec?.names?.kind ?? '') ===
                e.target.children[0].innerText
            );
          });
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
              `${linkTo(selectedEntry)}?layout=${'TwoColumnsMidExpanded'}`,
            );
          }
        }}
        columns={
          <HeaderRenderer
            entries={entries}
            actions={actions}
            headerRenderer={headerRenderer}
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
  showSearchControl: PropTypes.bool,
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
  currentlyEditedResourceUID: PropTypes.string,
  sortBy: PropTypes.oneOfType([PropTypes.object, PropTypes.func]),
  notFoundMessage: PropTypes.string,
  searchSettings: SearchProps,
  disableMargin: PropTypes.bool,
  enableColumnLayout: PropTypes.bool,
  customUrl: PropTypes.func,
  hasDetailsView: PropTypes.bool,
};

GenericList.defaultProps = {
  entries: [],
  actions: [],
  serverDataError: null,
  serverDataLoading: false,
  notFoundMessage: 'components.generic-list.messages.not-found',
  searchSettings: defaultSearch,
};
