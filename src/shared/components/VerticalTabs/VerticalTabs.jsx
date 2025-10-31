import PropTypes from 'prop-types';
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
    }),
  ).isRequired,
  children: childrenPropType,
  listRef: PropTypes.any.isRequired,
  tabId: PropTypes.number.isRequired,
  onSetTabId: PropTypes.func.isRequired,
};

export function VerticalTabs({
  tabs,
  children,
  listRef,
  tabId,
  onSetTabId: handleSetTabId,
}) {
  return (
    <section className="vertical-tabs-wrapper">
      <ul ref={listRef}>
        {tabs.map(({ id, ...props }) => (
          <TileButton
            key={id}
            {...props}
            isActive={id === tabId}
            handleClick={() => handleSetTabId(id)}
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
