import { useTranslation } from 'react-i18next';
import { IllustratedMessage } from '@ui5/webcomponents-react';
import pluralize from 'pluralize';
import { getErrorMessage } from 'shared/utils/helpers';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { BodyFallback } from './BodyFallback';
import { RowRenderer } from './RowRenderer';
import { ColumnLayoutState } from 'state/columnLayoutAtom';

export type FilteredEntriesType = {
  name: string;
  namespace: string;
  resource?: { metadata?: { namespace: string } };
  metadata?: { name: string; namespace: string; uid: string };
};

type SearchSettingsType = {
  showSearchField: boolean;
  textSearchProperties: any[];
  showSearchSuggestion: boolean;
  allowSlashShortcut: boolean;
  noSearchResultTitle: string;
  noSearchResultSubtitle: string;
};

type PaginationType = {
  itemsPerPage: number;
  initialPage: number;
  autoHide: boolean;
};

type TableBodyProps = {
  serverDataError: any;
  serverDataLoading: boolean;
  filteredEntries: FilteredEntriesType[];
  searchQuery: string;
  searchSettings: SearchSettingsType;
  entries: FilteredEntriesType[];
  pagination: PaginationType;
  currentPage: number;
  layoutState: ColumnLayoutState;
  entrySelected: string | string[];
  entrySelectedNamespace: string;
  actions: any[];
  rowRenderer: (entry: FilteredEntriesType, index: number) => any;
  displayArrow: boolean;
  hasDetailsView: boolean;
  enableColumnLayout: boolean;
};

export const TableBody = ({
  serverDataError,
  serverDataLoading,
  filteredEntries,
  searchQuery,
  searchSettings,
  entries,
  pagination,
  currentPage,
  layoutState,
  entrySelected,
  entrySelectedNamespace,
  actions,
  rowRenderer,
  displayArrow,
  hasDetailsView,
  enableColumnLayout,
}: TableBodyProps) => {
  const { i18n, t } = useTranslation();

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
          <IllustratedMessage
            name="NoSearchResults"
            titleText={
              i18n.exists(searchSettings.noSearchResultTitle)
                ? t(searchSettings.noSearchResultTitle)
                : searchSettings.noSearchResultTitle
            }
            subtitleText={
              i18n.exists(searchSettings.noSearchResultSubtitle)
                ? t(searchSettings.noSearchResultSubtitle)
                : searchSettings.noSearchResultSubtitle
            }
          />
        </BodyFallback>
      );
    }

    if (!entries.length) {
      return;
    }
  }

  let pagedItems = filteredEntries;
  if (pagination) {
    pagedItems = filteredEntries.slice(
      (currentPage - 1) * pagination.itemsPerPage,
      currentPage * pagination.itemsPerPage,
    );
  }

  return pagedItems.map((e: FilteredEntriesType, index: number) => {
    // Special case for Kyma modules
    let isModuleSelected;
    if (
      window.location.href.includes('kymamodules') &&
      layoutState?.midColumn
    ) {
      // Workaround for modules like btp-operator on refresh
      const resourceType = layoutState.midColumn.resourceType;
      const resourceTypeDotIndex = resourceType?.indexOf('.') || -1;
      const resourceTypeBase =
        resourceTypeDotIndex !== -1
          ? resourceType?.substring(0, resourceTypeDotIndex)
          : resourceType;

      // Check if the entry is selected using click or refresh
      isModuleSelected = entrySelected
        ? entrySelected instanceof Array
          ? entrySelected.some((entry) => entry === e?.name) &&
            (entrySelectedNamespace === e?.namespace ||
              entrySelectedNamespace === e?.resource?.metadata?.namespace)
          : entrySelected === e?.name &&
            (entrySelectedNamespace === e?.namespace ||
              entrySelectedNamespace === e?.resource?.metadata?.namespace)
        : pluralize(e?.name?.replace('-', '') || '') === resourceTypeBase;
    }
    const entrySelectedMatches =
      entrySelected instanceof Array
        ? entrySelected.some((entry) => entry === e?.metadata?.name)
        : entrySelected === e?.metadata?.name;
    return (
      <RowRenderer
        isSelected={
          ((layoutState?.midColumn?.resourceName === e.metadata?.name ||
            layoutState?.endColumn?.resourceName === e.metadata?.name) &&
            entrySelectedMatches &&
            (entrySelectedNamespace === '' ||
              entrySelectedNamespace === e?.metadata?.namespace)) ||
          isModuleSelected
        }
        index={index}
        key={`${e.metadata?.uid || e.name || e.metadata?.name}-${index}`}
        entry={e}
        actions={actions}
        rowRenderer={rowRenderer}
        displayArrow={displayArrow}
        hasDetailsView={hasDetailsView}
        enableColumnLayout={enableColumnLayout}
      />
    );
  });
};
