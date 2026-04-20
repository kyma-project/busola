import { useTranslation } from 'react-i18next';
import { IllustratedMessage } from '@ui5/webcomponents-react';
import { getErrorMessage } from 'shared/utils/helpers';
import { Spinner } from 'shared/components/Spinner/Spinner';
import { BodyFallback } from './BodyFallback';
import { RowRenderer } from './RowRenderer';
import { ColumnLayoutState } from 'state/columnLayoutAtom';

export type FilteredEntriesType = {
  name: string;
  namespace?: string;
  resource?: { metadata?: { namespace: string } };
  metadata?: { name: string; namespace: string; uid: string };
  [key: string]: any;
};

export type SearchSettingsType = {
  showSearchField?: boolean;
  textSearchProperties?: any[];
  showSearchSuggestion?: boolean;
  allowSlashShortcut?: boolean;
  noSearchResultTitle?: string;
  noSearchResultSubtitle?: string;
};

export type PaginationType = {
  itemsPerPage?: number;
  initialPage?: number;
  autoHide?: boolean;
};

type TableBodyProps = {
  serverDataError: any;
  serverDataLoading: boolean;
  filteredEntries: FilteredEntriesType[];
  searchQuery: string;
  searchSettings: SearchSettingsType;
  entries: FilteredEntriesType[];
  pagination?: PaginationType;
  currentPage: number;
  layoutState: ColumnLayoutState;
  entrySelected: string | string[];
  entrySelectedNamespace: string;
  actions: any[];
  rowRenderer: (entry: FilteredEntriesType, index: number) => any;
  displayArrow: boolean;
  hasRowDetails?: (entry: FilteredEntriesType) => boolean;
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
  hasRowDetails,
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
              searchSettings.noSearchResultTitle &&
              i18n.exists(searchSettings.noSearchResultTitle)
                ? t(searchSettings.noSearchResultTitle)
                : searchSettings.noSearchResultTitle
            }
            subtitleText={
              searchSettings.noSearchResultSubtitle &&
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
      (currentPage - 1) * (pagination?.itemsPerPage || 0),
      currentPage * (pagination?.itemsPerPage || 0),
    );
  }

  return pagedItems.map((e: FilteredEntriesType, index: number) => {
    // Module entries use `.name` instead of `.metadata.name`
    let isModuleSelected;
    if (e?.name && entrySelected) {
      const namespaceMatches =
        entrySelectedNamespace === '' ||
        entrySelectedNamespace === e?.namespace ||
        entrySelectedNamespace === e?.resource?.metadata?.namespace;

      isModuleSelected =
        entrySelected instanceof Array
          ? entrySelected.some((entry) => entry === e?.name) && namespaceMatches
          : entrySelected === e?.name && namespaceMatches;
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
        displayArrow={displayArrow && (hasRowDetails?.(e) ?? true)}
        hasDetails={hasRowDetails?.(e) ?? true}
        enableColumnLayout={enableColumnLayout}
      />
    );
  });
};
