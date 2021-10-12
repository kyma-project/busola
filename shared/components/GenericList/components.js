import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'fundamental-react';

import ListActions from '../ListActions/ListActions';
import classNames from 'classnames';

export const BodyFallback = ({ children }) => (
  <tr>
    <td colSpan="100%">
      <div className="body-fallback">{children}</div>
    </td>
  </tr>
);

export const HeaderRenderer = ({ actions, headerRenderer }) => {
  let emptyColumn = [];
  if (actions.length) {
    emptyColumn = [
      <th
        key="actions-column"
        aria-label="actions-column"
        className="fd-table__cell"
      ></th>,
    ];
  }
  return [
    headerRenderer().map((h, index) => (
      <th className="fd-table__cell" scope="col" key={h || index}>
        {h}
      </th>
    )),
    ...emptyColumn,
  ];
};

export const RowRenderer = ({ entry, actions, rowRenderer, ...others }) => {
  const filteredActions = actions.filter(a =>
    a.skipAction ? !a.skipAction(entry) : true,
  );
  const resolvedRowRenderer = rowRenderer(entry);

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
  actionsStandaloneItems,
  compact,
  isBeingEdited = false,
}) => {
  const cells = rowRenderer.map((cell, id) => {
    if (cell.content) {
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
      <ListActions
        actions={actions}
        entry={entry}
        standaloneItems={actionsStandaloneItems}
        compact={compact}
      />
    </td>
  );
  return (
    <tr className={classNames('fd-table__row', { 'is-edited': isBeingEdited })}>
      {cells}
      {!!actions.length && actionsCell}
    </tr>
  );
};

const CollapsedRowRenderer = ({
  rowRenderer: {
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
          glyph={isOpen ? 'navigation-up-arrow' : 'navigation-down-arrow'}
          option="transparent"
          onClick={() => setOpen(!isOpen)}
          compact={true}
          typeAttr="button"
        />
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
