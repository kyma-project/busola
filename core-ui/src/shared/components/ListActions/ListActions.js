import React from 'react';
import { Popover, Menu, Button } from 'fundamental-react';
import './ListActions.scss';

import PropTypes from 'prop-types';
import { Tooltip } from 'shared/components/Tooltip/Tooltip';
import CustomPropTypes from 'shared/typechecking/CustomPropTypes';

const AUTO_ICONS_BY_NAME = new Map([
  ['Edit', 'edit'],
  ['Delete', 'delete'],
  ['Details', 'detail-view'],
]);

const StandaloneAction = ({ action, entry, compact }) => {
  const icon = action.icon || AUTO_ICONS_BY_NAME.get(action.name);

  if (action.component) {
    return action.component(entry);
  }
  const actionButton = (
    <Button
      data-testid={action.name.replace(' ', '').toLowerCase()}
      onClick={() => action.handler(entry)}
      className="list-actions__standalone"
      option="transparent"
      glyph={typeof icon === 'function' ? icon(entry) : icon}
      aria-label={action.name}
      typeAttr="button"
      compact={compact}
      disabled={action.disabledHandler && action.disabledHandler(entry)}
    >
      {icon ? '' : action.name}
    </Button>
  );

  return action.tooltip ? (
    <Tooltip
      className="actions-tooltip"
      content={
        typeof action.tooltip === 'function'
          ? action.tooltip(entry)
          : action.tooltip
      }
    >
      {' '}
      {actionButton}{' '}
    </Tooltip>
  ) : (
    <> {actionButton} </>
  );
};

const ListActions = ({ actions, entry, compact }) => {
  if (!actions.length) {
    return null;
  }

  const listItems = actions.slice(3, actions.length);
  return (
    <div className="list-actions">
      {actions.slice(0, 3).map(a => (
        <StandaloneAction
          key={a.name}
          action={a}
          entry={entry}
          compact={compact}
        />
      ))}
      {listItems.length ? (
        <Popover
          body={
            <Menu>
              <Menu.List>
                {listItems.map(a => (
                  <Menu.Item onClick={() => a.handler(entry)} key={a.name}>
                    {a.name}
                  </Menu.Item>
                ))}
              </Menu.List>
            </Menu>
          }
          control={
            <Button
              glyph="vertical-grip"
              option="transparent"
              aria-label="more-actions"
            />
          }
          placement="bottom-end"
        />
      ) : null}
    </div>
  );
};

ListActions.propTypes = {
  actions: CustomPropTypes.listActions,
  entry: PropTypes.any.isRequired,
  compact: PropTypes.bool,
};

export default ListActions;
