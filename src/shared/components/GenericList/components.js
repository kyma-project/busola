import React, { useState } from 'react';
import { Button, Icon } from 'fundamental-react';
import {
  Text,
  FlexBox,
  TableCell,
  TableColumn,
  TableRow,
  Label,
} from '@ui5/webcomponents-react';
import ListActions from 'shared/components/ListActions/ListActions';
import classNames from 'classnames';

export const BodyFallback = ({ children }) => (
  <TableRow>
    <TableCell>
      <FlexBox className="body-fallback">{children}</FlexBox>
    </TableCell>
  </TableRow>
);

export const HeaderRenderer = ({ slot, actions, headerRenderer }) => {
  let emptyColumn = null;
  if (actions.length) {
    emptyColumn = (
      <TableColumn
        slot={slot}
        style={{ width: '2rem' }}
        key="actions-column"
        aria-label="actions-column"
      >
        <Label></Label>
      </TableColumn>
    );
  }
  const Header = (
    <>
      {' '}
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
  console.log('resolvedRowRenderer', resolvedRowRenderer);
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
  console.log('!!!!!!!!!collapsed');
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
  compact,
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
      <ListActions actions={actions} entry={entry} compact={compact} />
    </TableCell>
  );
  return (
    <TableRow
      role="row"
      className={classNames('fd-table__row', { 'is-edited': isBeingEdited })}
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
          option="transparent"
          onClick={() => setOpen(!isOpen)}
          compact={true}
          typeAttr="button"
        >
          <Icon
            className="fd-margin-end--tiny"
            glyph={isOpen ? 'navigation-up-arrow' : 'navigation-down-arrow'}
          />
          {title}
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
    <tr
      role="row"
      className="collapse-content fd-table__row"
      data-testid="collapse-content"
    >
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

// --------------> OLD <----------------

export const OLDBodyFallback = ({ children }) => (
  <tr>
    <td colSpan="100%">
      <div className="body-fallback">{children}</div>
    </td>
  </tr>
);

export const OLDHeaderRenderer = ({ actions, headerRenderer }) => {
  let OLDemptyColumn = [];
  if (actions.length) {
    OLDemptyColumn = [
      <th
        key="actions-column"
        aria-label="actions-column"
        className="fd-table__cell"
      ></th>,
    ];
  }
  return [
    headerRenderer().map((h, index) => {
      console.log('loloa', h);
      return (
        <th
          className="fd-table__cell"
          scope="col"
          key={typeof h === 'object' ? index : h}
        >
          {h}
        </th>
      );
    }),
    ...OLDemptyColumn,
  ];
};

export const OLDRowRenderer = ({
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
  console.log('resolvedRowRenderer', resolvedRowRenderer);
  if (Array.isArray(resolvedRowRenderer)) {
    return (
      <OLDDefaultRowRenderer
        {...others}
        entry={entry}
        actions={filteredActions}
        rowRenderer={resolvedRowRenderer}
      />
    );
  }
  console.log('!!!!!!!!!collapsed');
  return (
    <OLDCollapsedRowRenderer
      {...others}
      entry={entry}
      actions={filteredActions}
      rowRenderer={resolvedRowRenderer}
    />
  );
};

const OLDDefaultRowRenderer = ({
  entry,
  actions,
  rowRenderer,
  compact,
  isBeingEdited = false,
}) => {
  const cells = rowRenderer.map((cell, id) => {
    if (cell?.content) {
      const { content, ...props } = cell;
      return (
        <td className="fd-table__cell" key={id} {...props}>
          {content}
        </td>
      );
    } else {
      return (
        <td className="fd-table__cell" key={id}>
          {cell}
        </td>
      );
    }
  });
  const actionsCell = (
    <td className="fd-table__cell">
      <ListActions actions={actions} entry={entry} compact={compact} />
    </td>
  );
  return (
    <tr
      role="row"
      className={classNames('fd-table__row', { 'is-edited': isBeingEdited })}
    >
      {cells}
      {!!actions.length && actionsCell}
    </tr>
  );
};

const OLDCollapsedRowRenderer = ({
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
          option="transparent"
          onClick={() => setOpen(!isOpen)}
          compact={true}
          typeAttr="button"
        >
          <Icon
            className="fd-margin-end--tiny"
            glyph={isOpen ? 'navigation-up-arrow' : 'navigation-down-arrow'}
          />
          {title}
        </Button>
      ) : (
        <></>
      ),
      ...cells,
    ];
  }

  const defaultRow = (
    <OLDDefaultRowRenderer rowRenderer={rowRenderer} {...props} />
  );

  let collapseRow = collapseContent && (
    <tr
      role="row"
      className="collapse-content fd-table__row"
      data-testid="collapse-content"
    >
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
