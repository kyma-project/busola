import { useState } from 'react';
import {
  Button,
  FlexBox,
  Icon,
  Label,
  TableCell,
  TableColumn,
  TableRow,
  Text,
} from '@ui5/webcomponents-react';
import ListActions from 'shared/components/ListActions/ListActions';
import classNames from 'classnames';

export const BodyFallback = ({ children }) => (
  // TODO replace once new Table component is available in ui5-webcomponents-react
  <tr>
    <td colspan="100%">
      <div className="body-fallback">{children}</div>{' '}
    </td>
  </tr>
);

export const HeaderRenderer = ({ slot, actions, headerRenderer }) => {
  let emptyColumn = null;
  if (actions.length) {
    emptyColumn = (
      <TableColumn slot={slot} key="actions-column" aria-label="actions-column">
        <Label></Label>
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
          >
            <Text>{h}</Text>
          </TableColumn>
        );
      })}
      {emptyColumn}
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
  isBeingEdited = false,
}) => {
  const cells = rowRenderer.map((cell, id) => {
    if (cell?.content) {
      const { content, ...props } = cell;
      return (
        <TableCell key={id} {...props}>
          {' '}
          {content}
        </TableCell>
      );
    } else {
      return <TableCell key={id}> {cell}</TableCell>;
    }
  });
  const actionsCell = (
    <TableCell>
      <ListActions actions={actions} entry={entry} />
    </TableCell>
  );
  return (
    <TableRow
      role="row"
      selected={isBeingEdited}
      className={classNames({ 'is-edited': isBeingEdited })}
    >
      {cells}
      {!!actions.length && actionsCell}
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
              className="fd-margin-end--tiny"
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
