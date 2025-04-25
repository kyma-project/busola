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
} from '@ui5/webcomponents-react';

import ListActions from 'shared/components/ListActions/ListActions';

export const BodyFallback = ({ children }) => (
  <TableCell slot="nodata" style={{ width: '100%' }}>
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
  const checkCellImportance = h => {
    if (h === 'Popin') {
      return -1;
    }
    if (Array.isArray(noHideFields) && noHideFields.includes(h)) {
      return 1;
    } else {
      return 0;
    }
  };
  const setCellMinWidth = h => {
    if (Array.isArray(noHideFields) && noHideFields?.length) {
      return noHideFields.find(field => field === h)
        ? `calc(100%/${getColumnsLength()})`
        : '100px';
    } else if (h === 'Popin') {
      return '100%';
    } else if (disableHiding) {
      return h === 'Name' || h === '' ? '120px' : 'auto';
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
  const filteredActions = actions?.filter(a =>
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
    <TableCell horizontalAlign="Right">
      <ListActions actions={actions} entry={entry} />
    </TableCell>
  );

  return (
    <TableRow
      className={isSelected ? 'row-selected' : 'row'}
      interactive={true}
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
