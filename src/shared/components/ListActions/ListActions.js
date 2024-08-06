import React, { useState } from 'react';
import { Button, Menu, MenuItem } from '@ui5/webcomponents-react';

import PropTypes from 'prop-types';
import CustomPropTypes from 'shared/typechecking/CustomPropTypes';

import './ListActions.scss';

const AUTO_ICONS_BY_NAME = new Map([
  ['Edit', 'edit'],
  ['Delete', 'delete'],
  ['Details', 'detail-view'],
]);

const StandaloneAction = ({ action, entry }) => {
  const icon = action.icon || AUTO_ICONS_BY_NAME.get(action.name);

  if (action.component) {
    return action.component(entry);
  }

  return (
    <Button
      data-testid={action.name.replace(' ', '').toLowerCase()}
      onClick={() => action.handler(entry)}
      className="list-actions__standalone"
      design="Transparent"
      icon={typeof icon === 'function' ? icon(entry) : icon}
      aria-label={action.name}
      disabled={action.disabledHandler && action.disabledHandler(entry)}
      tooltip={
        typeof action.tooltip === 'function'
          ? action.tooltip(entry)
          : action.tooltip
      }
    >
      {icon ? '' : action.name}
    </Button>
  );
};

const ListActions = ({ actions, entry }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!actions.length) {
    return null;
  }

  const listItems = actions.slice(3, actions.length);

  return (
    <div className="list-actions">
      {actions.slice(0, 3).map(a => (
        <StandaloneAction key={a.name} action={a} entry={entry} />
      ))}
      {listItems.length ? (
        <>
          <Button
            id={'openMenuBtn'}
            icon="vertical-grip"
            design="Transparent"
            aria-label="more-actions"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
          <Menu
            open={isMenuOpen}
            opener={'openMenuBtn'}
            onAfterClose={() => {
              setIsMenuOpen(false);
            }}
          >
            {listItems.map(a => (
              <MenuItem
                onClick={() => a.handler(entry)}
                key={a.name}
                text={a.name}
              />
            ))}
          </Menu>
        </>
      ) : null}
    </div>
  );
};

ListActions.propTypes = {
  actions: CustomPropTypes.listActions,
  entry: PropTypes.any.isRequired,
};

export default ListActions;
