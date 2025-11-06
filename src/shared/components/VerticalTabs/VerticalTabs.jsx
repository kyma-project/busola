import PropTypes from 'prop-types';
import { List } from '@ui5/webcomponents-react';
import { TileButton } from 'shared/components/TileButton/TileButton';

import './VerticalTabs.scss';

const childrenPropType = PropTypes.oneOfType([
  PropTypes.arrayOf(PropTypes.node),
  PropTypes.node,
]).isRequired;

const tabIdPropType = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.number,
]).isRequired;

VerticalTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: tabIdPropType,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      icon: PropTypes.node.isRequired,
      onActivate: PropTypes.func,
    }),
  ).isRequired,
  children: childrenPropType,
  tabId: PropTypes.number.isRequired,
  onSetTabId: PropTypes.func.isRequired,
};

export function VerticalTabs({
  tabs,
  children,
  tabId,
  onSetTabId: handleSetTabId,
}) {
  const handleActivateTabWithId = (id, onActivate) => {
    handleSetTabId(id);
    if (onActivate) onActivate();
  };
  return (
    <section className="vertical-tabs-wrapper">
      <List>
        {tabs.map(({ id, onActivate: handleActivate, ...props }) => (
          <TileButton
            key={id}
            {...props}
            isActive={id === tabId}
            onActivate={() => handleActivateTabWithId(id, handleActivate)}
          />
        ))}
      </List>
      {children.filter(({ props }) => props.id === tabId)}
    </section>
  );
}

VerticalTabs.Content = ({ children }) => children;

VerticalTabs.Content.propTypes = {
  id: tabIdPropType,
  children: childrenPropType,
};
