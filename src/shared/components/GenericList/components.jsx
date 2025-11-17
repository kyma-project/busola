import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  FlexBox,
  Icon,
  TableCell,
  TableRow,
  TableHeaderRow,
  Text,
  TableHeaderCell,
  TableRowActionNavigation,
  IllustratedMessage,
} from '@ui5/webcomponents-react';

import ListActions from 'shared/components/ListActions/ListActions';
import pluralize from 'pluralize';
import { getErrorMessage } from 'shared/utils/helpers';
import { Spinner } from '../Spinner/Spinner';

export const BodyFallback = ({ children }) => (
  <TableCell slot="noData" style={{ width: '100%' }}>
    <div className="body-fallback">{children}</div>
  </TableCell>
);

export const HeaderRenderer = ({
  actions,
  headerRenderer,
  disableHiding = true,
  noHideFields,
}) => {
  const { t } = useTranslation();
  let emptyColumn = null;
  const getColumnsLength = () => {
    let columnsLength = headerRenderer().length;
    if (actions?.length) {
      columnsLength += 1;
    }
    return columnsLength;
  };
  if (actions?.length) {
    emptyColumn = (
      <TableHeaderCell
        importance={0}
        popinHidden={true}
        key="actions-column"
        aria-label="actions-column"
        minWidth={`${30 * actions.length}px`}
      >
        <Text />
      </TableHeaderCell>
    );
  }
  const checkCellImportance = (h) => {
    if (h === 'Popin') {
      return -1;
    }
    if (Array.isArray(noHideFields) && noHideFields.includes(h)) {
      return 1;
    } else {
      return 0;
    }
  };
  const setCellMinWidth = (h) => {
    if (Array.isArray(noHideFields) && noHideFields?.length) {
      return noHideFields.find((field) => field === h)
        ? `calc(100%/${getColumnsLength()})`
        : '100px';
    } else if (h === 'Popin') {
      return '100%';
    } else if (disableHiding && (h === 'Name' || h === '')) {
      return '200px';
    } else if (disableHiding) {
      return 'auto';
    } else {
      return '100px';
    }
  };
  const Header =
    headerRenderer()?.length || emptyColumn ? (
      <TableHeaderRow slot="headerRow">
        {headerRenderer()?.map((h, index) => {
          return (
            <TableHeaderCell
              key={typeof h === 'object' ? index : h}
              popinText={h === 'Popin' ? t('common.headers.specification') : h}
              popinHidden={h !== 'Popin' && !noHideFields?.includes(h)}
              importance={checkCellImportance(h)}
              minWidth={setCellMinWidth(h)}
              aria-label={`${typeof h === 'object' ? index : h}-column`}
            >
              <Text>{h}</Text>
            </TableHeaderCell>
          );
        })}
        {emptyColumn}
      </TableHeaderRow>
    ) : (
      <></>
    );

  return Header;
};

export const RowRenderer = ({
  entry,
  actions,
  rowRenderer,
  index,
  ...others
}) => {
  const filteredActions = actions?.filter((a) =>
    a.skipAction ? !a.skipAction(entry) : true,
  );
  const resolvedRowRenderer = rowRenderer(entry, index);

  if (Array.isArray(resolvedRowRenderer)) {
    return (
      <DefaultRowRenderer
        {...others}
        entry={entry}
        actions={filteredActions}
        rowRenderer={resolvedRowRenderer}
      />
    );
  }
  return (
    <CollapsedRowRenderer
      {...others}
      entry={entry}
      actions={filteredActions}
      rowRenderer={resolvedRowRenderer}
    />
  );
};

const DefaultRowRenderer = ({
  entry,
  actions,
  rowRenderer,
  isSelected = false,
  displayArrow = false,
  hasDetailsView,
  enableColumnLayout = false,
}) => {
  const cells = rowRenderer.map((cell, id) => {
    if (cell?.content) {
      const { content, ...props } = cell;
      return (
        <TableCell key={id} {...props}>
          {content}
        </TableCell>
      );
    } else {
      return <TableCell key={id}>{cell}</TableCell>;
    }
  });
  const actionsCell = (
    <TableCell
      horizontalAlign="Right"
      style={{
        paddingRight: enableColumnLayout ? '0' : '0.5rem',
      }}
    >
      <ListActions actions={actions} entry={entry} />
    </TableCell>
  );

  return (
    <TableRow
      className={isSelected ? 'row-selected' : 'row'}
      interactive={enableColumnLayout}
      navigated={isSelected}
      actions={displayArrow && <TableRowActionNavigation />}
    >
      {cells}
      {!!actions?.length && actionsCell}
    </TableRow>
  );
};

const CollapsedRowRenderer = ({
  rowRenderer: {
    title,
    cells,
    collapseContent,
    withCollapseControl = true,
    showCollapseControl = true,
  },
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  let rowRenderer = cells;
  if (withCollapseControl) {
    rowRenderer = [
      showCollapseControl ? (
        <div style={{ display: 'flex' }}>
          <Button
            data-testid={
              isOpen ? 'collapse-button-open' : 'collapse-button-close'
            }
            design="Transparent"
            onClick={() => setIsOpen(!isOpen)}
          >
            <FlexBox>
              <Icon
                className="sap-margin-end-tiny"
                name={isOpen ? 'navigation-up-arrow' : 'navigation-down-arrow'}
              />
              {title}
            </FlexBox>
          </Button>
        </div>
      ) : (
        <></>
      ),
      ...cells,
    ];
  }

  const defaultRow = (
    <DefaultRowRenderer rowRenderer={rowRenderer} {...props} />
  );

  let collapseRow = collapseContent && (
    <TableRow
      role="row"
      className="collapse-content"
      data-testid="collapse-content"
    >
      {collapseContent}
    </TableRow>
  );
  if (withCollapseControl) {
    collapseRow = isOpen ? collapseRow : null;
  }

  return (
    <>
      {defaultRow}
      {collapseRow}
    </>
  );
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
}) => {
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

  return pagedItems.map((e, index) => {
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
          ? resourceType.substring(0, resourceTypeDotIndex)
          : resourceType;

      // Check if the entry is selected using click or refresh
      isModuleSelected = entrySelected
        ? entrySelected === e?.name
        : pluralize(e?.name?.replace('-', '') || '') === resourceTypeBase;
    }
    console.log('test-kon:', {
      'layoutState?.midColumn?.resourceName':
        layoutState?.midColumn?.resourceName,
      'layoutState?.endColumn?.resourceName':
        layoutState?.endColumn?.resourceName,
      entrySelected: entrySelected,
      'e?.metadata?.name': e?.metadata?.name,
      entrySelectedNamespace: entrySelectedNamespace,
      'e?.metadata?.namespace': e?.metadata?.namespace,
      isModuleSelected: isModuleSelected,
    });
    return (
      <RowRenderer
        isSelected={
          // TODO: in functions: e?.metadata?.name is with dot and some id and that's why is different then resourceName
          ((layoutState?.midColumn?.resourceName === e.metadata?.name ||
            layoutState?.endColumn?.resourceName === e.metadata?.name) &&
            entrySelected === e?.metadata?.name &&
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
