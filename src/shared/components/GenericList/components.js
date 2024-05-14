import { useState } from 'react';
import {
  Button,
  FlexBox,
  Icon,
  Text,
  TableCell,
  TableColumn,
  TableRow,
} from '@ui5/webcomponents-react';
import ListActions from 'shared/components/ListActions/ListActions';

import { spacing } from '@ui5/webcomponents-react-base';

export const BodyFallback = ({ children }) => (
  // TODO replace once new Table component is available in ui5-webcomponents-react
  <tr>
    <td colSpan="100%">
      <div className="body-fallback">{children}</div>
    </td>
  </tr>
);

export const HeaderRenderer = ({
  slot,
  actions,
  headerRenderer,
  disableHiding = true,
  displayArrow = false,
  noHideFields,
}) => {
  let emptyColumn = null;
  if (actions.length) {
    emptyColumn = (
      <TableColumn
        slot={slot}
        key="actions-column"
        aria-label="actions-column"
        minWidth={850}
      >
        <Text />
      </TableColumn>
    );
  }
  const Header = (
    <>
      {headerRenderer().map((h, index) => {
        return (
          <TableColumn
            slot={`${slot}-${index}`}
            key={typeof h === 'object' ? index : h}
            popinDisplay="Block"
            demandPopin={h === 'Labels' ? true : false}
            minWidth={
              Array.isArray(noHideFields) && noHideFields.length !== 0
                ? noHideFields.find(field => field === h)
                  ? ''
                  : 850
                : h === 'Labels'
                ? '15000'
                : disableHiding
                ? ''
                : h !== 'Name' && h !== ''
                ? 850
                : ''
            }
            aria-label={`${typeof h === 'object' ? index : h}-column`}
          >
            <Text>{h}</Text>
          </TableColumn>
        );
      })}
      {emptyColumn}
      {displayArrow && (
        <TableColumn slot={slot} key="arrow-column" aria-label="arrow-column">
          <Text />
        </TableColumn>
      )}
    </>
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
  const filteredActions = actions.filter(a =>
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
    <TableCell>
      <ListActions actions={actions} entry={entry} />
    </TableCell>
  );

  return (
    <TableRow
      type={hasDetailsView ? 'Active' : 'Inactive'}
      navigated={isSelected}
      selected={isSelected}
    >
      {cells}
      {!!actions.length && actionsCell}
      {displayArrow && (
        <TableCell style={{ padding: 0 }}>
          <Icon name="slim-arrow-right" design="Neutral" />
        </TableCell>
      )}
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
  const [isOpen, setOpen] = useState(false);

  let rowRenderer = cells;
  if (withCollapseControl) {
    rowRenderer = [
      showCollapseControl ? (
        <Button
          data-testid={
            isOpen ? 'collapse-button-open' : 'collapse-button-close'
          }
          design="Transparent"
          onClick={() => setOpen(!isOpen)}
        >
          <FlexBox>
            <Icon
              style={spacing.sapUiTinyMarginEnd}
              name={isOpen ? 'navigation-up-arrow' : 'navigation-down-arrow'}
            />
            {title}
          </FlexBox>
        </Button>
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
    // TODO replace once new Table component is available in ui5-webcomponents-react
    <tr role="row" className="collapse-content" data-testid="collapse-content">
      {collapseContent}
    </tr>
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
