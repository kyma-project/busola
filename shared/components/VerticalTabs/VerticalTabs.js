import React from 'react';

import PropTypes from 'prop-types';
import { TileButton } from '../TileButton/TileButton';

import './VerticalTabs.scss';

const childrenPropType = PropTypes.oneOfType([
  PropTypes.arrayOf(PropTypes.node),
  PropTypes.node,
]).isRequired;

const tabIdPropType = PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  .isRequired;

VerticalTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: tabIdPropType,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      icon: PropTypes.node.isRequired,
    }),
  ).isRequired,
  children: childrenPropType,
  height: PropTypes.string,
};

export function VerticalTabs({ tabs, children, height }) {
  const [tabId, setTabId] = React.useState(children[0]?.props.id || 0);

  return (
    <section className="vertical-tabs-wrapper" style={{ height }}>
      <ul>
        {tabs.map(({ id, ...props }) => (
          <TileButton
            key={id}
            {...props}
            isActive={id === tabId}
            handleClick={() => setTabId(id)}
          />
        ))}
      </ul>
      {children.filter(({ props }) => props.id === tabId)}
    </section>
  );
}

VerticalTabs.Content = ({ children }) => children;

VerticalTabs.Content.propTypes = {
  id: tabIdPropType,
  children: childrenPropType,
};
