import { useRef, useState } from 'react';

import PropTypes from 'prop-types';
import { TileButton } from 'shared/components/TileButton/TileButton';
import { useEventListener } from 'hooks/useEventListener';

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
};

export function VerticalTabs({ tabs, children }) {
  const [tabId, setTabId] = useState(children[0]?.props.id || 0);
  const listRef = useRef(null);

  useEventListener(
    'keydown',
    (e) => {
      const { key } = e;
      if (key === 'ArrowDown' && tabId <= tabs?.length - 1) {
        setTabId(tabId + 1);
        listRef.current.children[tabId].children[0].focus();
      } else if (key === 'ArrowUp' && tabId > 1) {
        setTabId(tabId - 1);
        listRef.current.children[tabId - 2].children[0].focus();
      }
    },
    [tabId, tabs],
  );

  return (
    <section className="vertical-tabs-wrapper">
      <ul ref={listRef}>
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
